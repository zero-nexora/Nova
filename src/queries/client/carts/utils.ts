import { Cart } from "./types";

// Shared select configuration for cart queries
const cartSelect = {
  id: true,
  user_id: true,
  created_at: true,
  updated_at: true,
  items: {
    select: {
      id: true,
      quantity: true,
      productVariant: {
        select: {
          id: true,
          sku: true,
          price: true,
          slug: true,
          stock_quantity: true,
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              images: {
                select: {
                  id: true,
                  image_url: true,
                  public_id: true,
                },
              },
            },
          },
          attributes: {
            select: {
              id: true,
              attributeValue: {
                select: {
                  id: true,
                  value: true,
                  attribute: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

// Utility function to get or create cart
export const getOrCreateCart = async (
  db: any,
  userId: string
): Promise<Cart> => {
  let cart = await db.carts.findUnique({
    where: { user_id: userId },
    select: cartSelect,
  });

  if (!cart) {
    cart = await db.carts.create({
      data: { user_id: userId },
      select: cartSelect,
    });
  }

  return cart;
};
