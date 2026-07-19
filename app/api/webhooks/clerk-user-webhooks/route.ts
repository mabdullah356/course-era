import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { prisma } from "@/lib/prisma";

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

interface ClerkWebhookEvent {
  type: string;
  data: {
    id: string;
    email_addresses?: { email_address: string; id: string }[];
    first_name?: string;
    last_name?: string;
    image_url?: string;
    gender?: string;
    birthday?: string;
    phone_numbers?: { phone_number: string; id: string }[];
  };
}

export async function POST(req: NextRequest) {
  if (!webhookSecret) {
    throw new Error("CLERK_WEBHOOK_SECRET is not set");
  }

  const body = await req.text();
  const headerPayload = req.headers;

  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  const wh = new Webhook(webhookSecret);

  let event: ClerkWebhookEvent;

  try {
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkWebhookEvent;
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const eventType = event.type;

  if (eventType === "user.created") {
    const { id, email_addresses, first_name, last_name, image_url, gender, birthday, phone_numbers } = event.data;

    const email = email_addresses?.[0]?.email_address ?? "";
    const phone = phone_numbers?.[0]?.phone_number ?? null;

    try {
      await prisma.user.create({
        data: {
          clerkId: id,
          email,
          firstName: first_name ?? "",
          lastName: last_name ?? "",
          profilePhoto: image_url ?? null,
          gender: gender ?? null,
          birthday: birthday ?? null,
          phone,
        },
      });
    } catch (err) {
      console.error("Error creating user:", err);
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
    }
  }


  return NextResponse.json({ received: true });
}
