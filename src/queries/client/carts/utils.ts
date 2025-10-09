import { Cart } from "./types";

// Cấu hình select tối ưu cho giỏ hàng
export const cartSelect = {
  id: true,
  items: {
    select: {
      id: true,
      quantity: true,
      productVariant: {
        select: {
          id: true,
          sku: true,
          price: true,
          stock_quantity: true,
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              images: {
                select: {
                  image_url: true,
                },
                take: 1,
              },
            },
          },
          attributes: {
            select: {
              attributeValue: {
                select: {
                  value: true,
                  attribute: {
                    select: {
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

export const cartItemSelect = {
  id: true,
  quantity: true,
  productVariant: {
    select: {
      id: true,
      sku: true,
      price: true,
      stock_quantity: true,
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          images: {
            select: {
              image_url: true,
            },
            take: 1,
          },
        },
      },
      attributes: {
        select: {
          attributeValue: {
            select: {
              value: true,
              attribute: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  },
};

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

  // Chuẩn hóa image_url
  return {
    ...cart,
    items: cart.items.map((item: any) => ({
      ...item,
      productVariant: {
        ...item.productVariant,
        product: {
          ...item.productVariant.product,
          image_url: item.productVariant.product.images[0]?.image_url ?? null,
        },
      },
    })),
  };
};
