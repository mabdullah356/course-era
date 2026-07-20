import { prisma } from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { courseId } = await req.json();

  if (!courseId) {
    return NextResponse.json({ error: "Course ID is required" }, { status: 400 });
  }

  let user = await prisma.user.findUnique({ where: { clerkId: userId } });

  if (!user) {
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);
    const email = clerkUser.emailAddresses[0]?.emailAddress ?? "";

    user = await prisma.user.upsert({
      where: { clerkId: userId },
      update: {},
      create: {
        clerkId: userId,
        email,
        firstName: clerkUser.firstName ?? "",
        lastName: clerkUser.lastName ?? "",
        profilePhoto: clerkUser.imageUrl ?? null,
      },
    });
  }

  const course = await prisma.course.findUnique({ where: { id: courseId } });

  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  const existing = await prisma.enrollment.findUnique({
    where: { courseId_userId: { courseId, userId: user.id } },
  });

  if (existing) {
    return NextResponse.json({ error: "Already enrolled" }, { status: 409 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  const finalPrice =
    course.discount > 0
      ? course.price - (course.price * course.discount) / 100
      : course.price;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    customer_email: user.email,
    metadata: {
      courseId: course.id,
      userId: user.id,
    },
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: course.title,
            description: course.description,
            images: course.thumbnail ? [course.thumbnail] : [],
          },
          unit_amount: Math.round(finalPrice * 100),
        },
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/course/${course.id}?enrolled=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/course/${course.id}?canceled=true`,
  });

  return NextResponse.json({ url: session.url });
}
