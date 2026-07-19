import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";

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
    return NextResponse.json({ error: "CLERK_WEBHOOK_SECRET is not set" }, { status: 500 });
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
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Webhook verification failed", details: message }, { status: 400 });
  }

  const eventType = event.type;

  if (eventType === "user.created" || eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name, image_url, gender, birthday, phone_numbers } = event.data;

    const email = email_addresses?.[0]?.email_address ?? "";
    const phone = phone_numbers?.[0]?.phone_number ?? null;

    try {
      const { prisma } = await import("@/lib/prisma");

      if (eventType === "user.created") {
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
      } else {
        await prisma.user.update({
          where: { clerkId: id },
          data: {
            email,
            firstName: first_name ?? "",
            lastName: last_name ?? "",
            profilePhoto: image_url ?? null,
            gender: gender ?? null,
            birthday: birthday ?? null,
            phone,
          },
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return NextResponse.json({ error: "Database error", details: message }, { status: 500 });
    }
  }

  if (eventType === "user.deleted") {
    try {
      const { prisma } = await import("@/lib/prisma");
      await prisma.user.delete({
        where: { clerkId: event.data.id },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return NextResponse.json({ error: "Database error", details: message }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
