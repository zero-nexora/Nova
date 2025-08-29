import { Webhook } from "svix";
import { headers } from "next/headers";
import type { WebhookEvent } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { RoleName } from "@prisma/client";

const SIGNING_SECRET = process.env.CLERK_SIGNING_SECRET;

export async function POST(req: Request) {
  if (!SIGNING_SECRET)
    throw new Error(
      "Error: Please add CLERK_SIGNING_SECRET from Clerk Dashboard to .env or .env"
    );

  const wh = new Webhook(SIGNING_SECRET);

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature)
    return new Response("Error: Missing Svix headers", {
      status: 400,
    });

  const payload = await req.json();
  const body = JSON.stringify(payload);

  let event: WebhookEvent;

  try {
    event = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (error) {
    console.error("Error: Could not verify webhook: ", error);
    return new Response("Error: Verification error", {
      status: 400,
    });
  }

  const eventType = event.type;

  switch (eventType) {
    case "user.created": {
      const { data } = event;
      const user = await db.users.create({
        data: {
          clerkId: data.id,
          email: data.email_addresses[0].email_address,
          first_name: data.first_name,
          last_name: data.last_name,
          image_url: data.image_url,
        },
      });

      console.log("User created:", user.id);
      break;
    }
    case "user.updated": {
      const { data } = event;
      const user = await db.users.upsert({
        where: { clerkId: data.id },
        update: {
          first_name: data.first_name,
          last_name: data.last_name,
          image_url: data.image_url,
          email: data.email_addresses[0].email_address,
        },
        create: {
          clerkId: data.id,
          email: data.email_addresses[0].email_address,
          first_name: data.first_name,
          last_name: data.last_name,
          image_url: data.image_url,
        },
      });

      console.log("User update:", user.id);
      break;
    }
    case "user.deleted": {
      const { data } = event;

      const user = await db.users.delete({
        where: {
          clerkId: data.id,
        },
      });

      console.log("User delete:", user.id);
      break;
    }
    default:
      console.log("Missing event");
      break;
  }

  return new Response("Webhook received", { status: 200 });
}
