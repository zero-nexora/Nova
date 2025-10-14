import { User } from "./types";
import { TRPCError } from "@trpc/server";
import { auth } from "@clerk/nextjs/server";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";

export const usersRouter = createTRPCRouter({
  getCurrentUser: baseProcedure.query(async ({ ctx }): Promise<User | null> => {
    const { db } = ctx;
    const { userId } = await auth();

    if (!userId) return null;

    const user = await db.users.findUnique({
      where: {
        clerkId: userId,
      },
      select: {
        id: true,
        clerkId: true,
        email: true,
        first_name: true,
        last_name: true,
        created_at: true,
        updated_at: true,
        roles: {
          select: {
            role: {
              select: {
                id: true,
                name: true,
                description: true,
                permissions: {
                  select: {
                    permission: {
                      select: {
                        id: true,
                        name: true,
                        description: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        _count: {
          select: {
            wishlists: true,
          },
        },
        cart: {
          select: {
            _count: {
              select: {
                items: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    return user;
  }),
});
