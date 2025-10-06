import { Webhook } from "svix";
import { headers } from "next/headers";
import type {
  WebhookEvent,
  UserJSON,
  DeletedObjectJSON,
} from "@clerk/nextjs/server";
import { db } from "@/database/prisma";
import { RoleName } from "@prisma/client";

const SIGNING_SECRET = process.env.CLERK_SIGNING_SECRET;

export async function POST(req: Request) {
  if (!SIGNING_SECRET) {
    throw new Error(
      "CLERK_SIGNING_SECRET is required in environment variables"
    );
  }

  const webhook = new Webhook(SIGNING_SECRET);

  const headerPayload = await headers();
  const svixHeaders = {
    id: headerPayload.get("svix-id"),
    timestamp: headerPayload.get("svix-timestamp"),
    signature: headerPayload.get("svix-signature"),
  };

  if (!svixHeaders.id || !svixHeaders.timestamp || !svixHeaders.signature) {
    return new Response("Missing required Svix headers", { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  let event: WebhookEvent;
  try {
    event = webhook.verify(body, {
      "svix-id": svixHeaders.id,
      "svix-timestamp": svixHeaders.timestamp,
      "svix-signature": svixHeaders.signature,
    }) as WebhookEvent;
  } catch (error) {
    console.error("Webhook verification failed:", error);
    return new Response("Webhook verification failed", { status: 400 });
  }

  await handleWebhookEvent(event);

  return new Response("Webhook processed successfully", { status: 200 });
}

async function handleWebhookEvent(event: WebhookEvent) {
  const { type, data } = event;

  switch (type) {
    case "user.created":
      await handleUserCreated(data as UserJSON);
      break;

    case "user.updated":
      await handleUserUpdated(data as UserJSON);
      break;

    case "user.deleted":
      await handleUserDeleted(data as DeletedObjectJSON);
      break;

    default:
      console.log(`Unhandled event type: ${type}`);
  }
}

async function handleUserCreated(userData: UserJSON) {
  const email = userData.email_addresses[0]?.email_address ?? null;
  const user = await db.users.create({
    data: {
      clerkId: userData.id,
      email,
      first_name: userData.first_name,
      last_name: userData.last_name,
      image_url: userData.image_url,
    },
  });

  console.log(`User created: ${user.id}`);

  if (email === process.env.EMAIL_ADMIN) {
    const role = await db.roles.findUnique({
      where: {
        name: RoleName.ADMIN,
      },
    });

    if (role) {
      await db.user_Roles.create({
        data: {
          role_id: role.id,
          user_id: user.id,
        },
      });
    }
  }
}

async function handleUserUpdated(userData: UserJSON) {
  const user = await db.users.upsert({
    where: { clerkId: userData.id },
    update: {
      first_name: userData.first_name,
      last_name: userData.last_name,
      image_url: userData.image_url,
    },
    create: {
      clerkId: userData.id,
      email: userData.email_addresses[0]?.email_address ?? null,
      first_name: userData.first_name,
      last_name: userData.last_name,
      image_url: userData.image_url,
    },
  });

  if (user) {
    await db.carts.create({
      data: {
        user_id: user.id,
      },
    });
  }

  console.log(`User updated: ${user.id}`);
}

async function handleUserDeleted(userData: DeletedObjectJSON) {
  const user = await db.users.findUnique({ where: { clerkId: userData.id } });
  if (!user) throw new Response("User not found", { status: 404 });

  const deletedUser = await db.users.delete({
    where: { clerkId: userData.id },
  });

  console.log(`User deleted: ${deletedUser}`);
}
