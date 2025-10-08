// File: src/server/routers/cart.ts
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { Cart } from "./types";
import { getOrCreateCart } from "./utils";

export const cartsRouter = createTRPCRouter({
  // Get the current user's cart
  getCart: protectedProcedure.query(async ({ ctx }): Promise<Cart> => {
    const { db, userId } = ctx;
    return getOrCreateCart(db, userId);
  }),

  // Add item to cart
  addToCart: protectedProcedure
    .input(
      z.object({
        productVariantId: z.string().uuid(),
        quantity: z.number().int().min(1, "Quantity must be at least 1"),
      })
    )
    .mutation(async ({ ctx, input }): Promise<Cart> => {
      const { db, userId } = ctx;
      const { productVariantId, quantity } = input;

      // Validate product variant and stock
      const productVariant = await db.product_Variants.findUnique({
        where: { id: productVariantId },
        select: { id: true, stock_quantity: true },
      });

      if (!productVariant) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product variant not found",
        });
      }

      if (productVariant.stock_quantity < quantity) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Insufficient stock",
        });
      }

      // Get or create cart
      const cart = await getOrCreateCart(db, userId);

      // Check for existing item
      const existingItem = await db.cart_Items.findFirst({
        where: {
          cart_id: cart.id,
          product_variant_id: productVariant.id,
        },
        select: { id: true, quantity: true },
      });

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > productVariant.stock_quantity) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Total quantity exceeds available stock",
          });
        }

        await db.cart_Items.update({
          where: { id: existingItem.id },
          data: { quantity: newQuantity },
        });
      } else {
        await db.cart_Items.create({
          data: {
            cart_id: cart.id,
            product_variant_id: productVariant.id,
            quantity,
          },
        });
      }

      // Return updated cart
      return getOrCreateCart(db, userId);
    }),

  // Update cart item quantity
  updateCartItem: protectedProcedure
    .input(
      z.object({
        cartItemId: z.string().uuid(),
        quantity: z.number().int().min(1, "Quantity must be at least 1"),
      })
    )
    .mutation(async ({ ctx, input }): Promise<Cart> => {
      const { db, userId } = ctx;
      const { cartItemId, quantity } = input;

      // Validate cart item
      const cartItem = await db.cart_Items.findFirst({
        where: {
          id: cartItemId,
          cart: { user_id: userId },
        },
        select: {
          id: true,
          productVariant: {
            select: { stock_quantity: true },
          },
        },
      });

      if (!cartItem) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Cart item not found",
        });
      }

      if (cartItem.productVariant.stock_quantity < quantity) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Quantity exceeds available stock",
        });
      }

      await db.cart_Items.update({
        where: { id: cartItem.id },
        data: { quantity },
      });

      return getOrCreateCart(db, userId);
    }),

  // Delete cart item
  deleteCartItem: protectedProcedure
    .input(
      z.object({
        cartItemId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }): Promise<Cart> => {
      const { db, userId } = ctx;
      const { cartItemId } = input;

      // Validate cart item
      const cartItem = await db.cart_Items.findFirst({
        where: {
          id: cartItemId,
          cart: { user_id: userId },
        },
        select: { id: true },
      });

      if (!cartItem) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Cart item not found",
        });
      }

      await db.cart_Items.delete({
        where: { id: cartItemId },
      });

      return getOrCreateCart(db, userId);
    }),

  // Clear cart
  clearCart: protectedProcedure.mutation(async ({ ctx }): Promise<void> => {
    const { db, userId } = ctx;

    const cart = await db.carts.findUnique({
      where: { user_id: userId },
      select: { id: true },
    });

    if (!cart) {
      return;
    }

    await db.cart_Items.deleteMany({
      where: { cart_id: cart.id },
    });
  }),
});
