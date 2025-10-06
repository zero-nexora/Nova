import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import z from "zod";

export const wishlistsRouter = createTRPCRouter({
  toggle: protectedProcedure
    .input(
      z.object({
        productId: z.string().uuid("Invalid product ID"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { db, userId } = ctx;
      const { productId } = input;

      // Fetch user by clerkId
      const user = await db.users.findFirst({
        where: { clerkId: userId },
        select: { id: true },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // Check if product exists and is not deleted
      const product = await db.products.findFirst({
        where: { id: productId, is_deleted: false },
        select: { id: true, slug: true }, // Only select necessary fields
      });

      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      // Check if the product is already in the user's wishlist
      const existingWishlist = await db.wishlists.findFirst({
        where: { product_id: productId, user_id: user.id },
        select: { id: true },
      });

      // Toggle wishlist: delete if exists, create if not
      if (existingWishlist) {
        await db.wishlists.delete({
          where: { id: existingWishlist.id },
        });
        return { action: "removed", success: true, data: product.slug };
      } else {
        const wishlistCount = await db.wishlists.count({
          where: { user_id: user.id },
        });

        // Check if wishlist limit (100) is reached
        if (wishlistCount >= 100) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Wishlist limit reached (100 items maximum)",
          });
        }

        // Create new wishlist item
        await db.wishlists.create({
          data: { product_id: productId, user_id: user.id },
        });
        return {
          action: "added",
          success: true,
          data: product.slug,
        };
      }
    }),

  deleteMultiple: protectedProcedure
    .input(
      z.object({
        wishlistIds: z
          .array(z.string().uuid("Invalid wishlist ID"))
          .min(2, "At least one wishlist ID is required"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { db, userId } = ctx;
      const { wishlistIds } = input;

      const user = await db.users.findFirst({
        where: { clerkId: userId },
        select: { id: true },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // Verify that all wishlist items belong to the user
      const wishlists = await db.wishlists.findMany({
        where: {
          id: { in: wishlistIds },
          user_id: user.id,
        },
        select: { id: true },
      });

      if (wishlists.length !== wishlistIds.length) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "One or more wishlist items do not exist or belong to another user",
        });
      }

      // Delete the wishlist items
      await db.wishlists.deleteMany({
        where: { id: { in: wishlistIds } },
      });

      return { deletedCount: wishlists.length, success: true };
    }),
});
