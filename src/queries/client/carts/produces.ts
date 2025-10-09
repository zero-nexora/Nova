import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { Cart, CartItem } from "./types";
import { cartItemSelect, getOrCreateCart } from "./utils";

export const cartsRouter = createTRPCRouter({
  getCart: protectedProcedure.query(async ({ ctx }): Promise<Cart> => {
    const { db, userId } = ctx;
    return getOrCreateCart(db, userId);
  }),

  addToCart: protectedProcedure
    .input(
      z.object({
        productVariantId: z.string().uuid(),
        quantity: z.number().int().min(1, "Quantity must be at least 1"),
      })
    )
    .mutation(async ({ ctx, input }): Promise<CartItem> => {
      const { db, userId } = ctx;
      const { productVariantId, quantity } = input;

      const productVariant = await db.product_Variants.findUnique({
        where: { id: productVariantId },
        select: {
          id: true,
          stock_quantity: true,
          sku: true,
          price: true,
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              images: {
                select: { image_url: true },
                take: 1,
              },
            },
          },
          attributes: {
            select: {
              attributeValue: {
                select: {
                  id: true,
                  value: true,
                  attribute: { select: { id: true, name: true } },
                },
              },
            },
          },
        },
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

      const cart =
        (await db.carts.findUnique({
          where: { user_id: userId },
          select: { id: true },
        })) ??
        (await db.carts.create({
          data: { user_id: userId },
          select: { id: true },
        }));

      const existingItem = await db.cart_Items.findFirst({
        where: {
          cart_id: cart.id,
          product_variant_id: productVariantId,
        },
        select: { id: true, quantity: true },
      });

      let cartItem;
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > productVariant.stock_quantity) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Total quantity exceeds available stock",
          });
        }
        cartItem = await db.cart_Items.update({
          where: { id: existingItem.id },
          data: { quantity: newQuantity },
          select: cartItemSelect,
        });
      } else {
        cartItem = await db.cart_Items.create({
          data: {
            cart_id: cart.id,
            product_variant_id: productVariantId,
            quantity,
          },
          select: cartItemSelect,
        });
      }

      const attributes = productVariant.attributes.map((attr) => ({
        id: attr.attributeValue.attribute.id,
        name: attr.attributeValue.attribute.name,
        values: [
          {
            id: attr.attributeValue.id,
            value: attr.attributeValue.value,
          },
        ],
      }));

      return {
        ...cartItem,
        productVariant: {
          ...cartItem.productVariant,
          product: {
            ...cartItem.productVariant.product,
            image_url:
              cartItem.productVariant.product.images[0]?.image_url ?? null,
          },
          attributes,
        },
      };
    }),

  updateCartItem: protectedProcedure
    .input(
      z.object({
        cartItemId: z.string().uuid(),
        quantity: z.number().int().min(1, "Quantity must be at least 1"),
      })
    )
    .mutation(async ({ ctx, input }): Promise<CartItem> => {
      const { db, userId } = ctx;
      const { cartItemId, quantity } = input;

      const cartItem = await db.cart_Items.findFirst({
        where: {
          id: cartItemId,
          cart: { user_id: userId },
        },
        select: {
          id: true,
          productVariant: {
            select: {
              stock_quantity: true,
              attributes: {
                select: {
                  attributeValue: {
                    select: {
                      id: true,
                      value: true,
                      attribute: { select: { id: true, name: true } },
                    },
                  },
                },
              },
            },
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

      const updatedCartItem = await db.cart_Items.update({
        where: { id: cartItem.id },
        data: { quantity },
        select: cartItemSelect,
      });

      const attributes = cartItem.productVariant.attributes.map((attr) => ({
        id: attr.attributeValue.attribute.id,
        name: attr.attributeValue.attribute.name,
        values: [
          {
            id: attr.attributeValue.id,
            value: attr.attributeValue.value,
          },
        ],
      }));

      return {
        ...updatedCartItem,
        productVariant: {
          ...updatedCartItem.productVariant,
          product: {
            ...updatedCartItem.productVariant.product,
            image_url:
              updatedCartItem.productVariant.product.images[0]?.image_url ??
              null,
          },
          attributes,
        },
      };
    }),

  deleteCartItem: protectedProcedure
    .input(z.object({ cartItemId: z.string().uuid() }))
    .mutation(async ({ ctx, input }): Promise<{ cartItemId: string }> => {
      const { db, userId } = ctx;
      const { cartItemId } = input;

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

      return { cartItemId };
    }),

  clearCart: protectedProcedure.mutation(
    async ({ ctx }): Promise<{ success: true }> => {
      const { db, userId } = ctx;

      const cart = await db.carts.findUnique({
        where: { user_id: userId },
        select: { id: true },
      });

      if (cart) {
        await db.cart_Items.deleteMany({
          where: { cart_id: cart.id },
        });
      }

      return { success: true };
    }
  ),
});
