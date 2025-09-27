import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { GetInfiniteProductsSchema, ProductDetail } from "./types";
import { buildProductWhereClause } from "./utils";

export const productsRouter = createTRPCRouter({
  getAll: baseProcedure
    .input(GetInfiniteProductsSchema)
    .query(async ({ input, ctx }) => {
      const {
        limit,
        cursor,
        search,
        categoryId,
        subcategoryId,
        sortOrder,
        priceMin,
        priceMax,
      } = input;

      try {
        const baseWhere = buildProductWhereClause({
          search,
          categoryId,
          subcategoryId,
          priceMin,
          priceMax,
        });

        const where = { ...baseWhere, is_deleted: false };

        if (cursor) {
          if (sortOrder === "desc") {
            where.OR = [
              { updated_at: { lt: cursor.updatedAt } },
              {
                AND: [
                  { updated_at: cursor.updatedAt },
                  { id: { lt: cursor.id } },
                ],
              },
            ];
          } else {
            where.OR = [
              { updated_at: { gt: cursor.updatedAt } },
              {
                AND: [
                  { updated_at: cursor.updatedAt },
                  { id: { gt: cursor.id } },
                ],
              },
            ];
          }
        }

        const orderBy = [{ updated_at: sortOrder }, { id: sortOrder }];

        const products = await ctx.db.products.findMany({
          where,
          take: limit + 1,
          orderBy,
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            is_deleted: true,
            created_at: true,
            updated_at: true,
            category: {
              select: { id: true, name: true, slug: true },
            },
            subcategory: {
              select: { id: true, name: true, slug: true },
            },
            images: {
              select: { id: true, image_url: true, public_id: true },
              take: 1,
              orderBy: { created_at: "asc" },
            },
            variants: {
              select: {
                id: true,
                sku: true,
                price: true,
                stock_quantity: true,
                attributes: {
                  select: {
                    id: true,
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
              orderBy: { price: "asc" },
            },
            _count: {
              select: { reviews: true, variants: true },
            },
          },
        });

        const hasMore = products.length > limit;
        const items = hasMore ? products.slice(0, -1) : products;
        const lastItem = items[items.length - 1];

        const nextCursor = hasMore
          ? { id: lastItem.id, updatedAt: lastItem.updated_at }
          : null;

        return {
          products: items,
          nextCursor,
          hasMore,
        };
      } catch (error) {
        console.error("Error fetching infinite products:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch products",
        });
      }
    }),

  getByCategory: baseProcedure
    .input(
      z.object({
        categoryId: z.string().uuid("Invalid category id"),
        includeDeleted: z.boolean().optional().default(false),
      })
    )
    .query(async ({ input, ctx }) => {
      const products = await ctx.db.products.findMany({
        where: {
          category_id: input.categoryId,
          ...(input.includeDeleted ? {} : { is_deleted: false }),
        },
        select: {
          id: true,
          name: true,
          slug: true,
          is_deleted: true,
          created_at: true,
          images: {
            select: {
              id: true,
              image_url: true,
            },
            take: 1,
            orderBy: { created_at: "asc" },
          },
          variants: {
            select: {
              id: true,
              price: true,
              stock_quantity: true,
            },
            orderBy: { price: "asc" },
            take: 1,
          },
          _count: {
            select: {
              variants: true,
            },
          },
        },
        orderBy: { created_at: "desc" },
      });

      return products;
    }),
  getBySlug: baseProcedure
    .input(
      z.object({
        slug: z.string().min(1, "Slug is required"),
      })
    )
    .query(async ({ ctx, input }): Promise<ProductDetail> => {
      const { slug } = input;

      const product = await ctx.db.products.findFirst({
        where: {
          slug,
          is_deleted: false,
        },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          updated_at: true,
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          subcategory: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          images: {
            select: {
              id: true,
              image_url: true,
              public_id: true,
            },
          },
          variants: {
            select: {
              id: true,
              sku: true,
              price: true,
              stock_quantity: true,
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
                          values: {
                            select: {
                              id: true,
                              value: true,
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
        },
      });

      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      const attributeMap: Record<
        string,
        {
          id: string;
          name: string;
          values: { id: string; value: string; available: boolean }[];
        }
      > = {};

      product.variants.forEach((variant) => {
        variant.attributes.forEach((attr) => {
          const attribute = attr.attributeValue.attribute;
          const attributeId = attribute.id;

          if (!attributeMap[attributeId]) {
            attributeMap[attributeId] = {
              id: attributeId,
              name: attribute.name,
              values: attribute.values.map((val) => ({
                id: val.id,
                value: val.value,
                available: false,
              })),
            };
          }

          if (variant.stock_quantity > 0) {
            attributeMap[attributeId].values = attributeMap[
              attributeId
            ].values.map((val) =>
              val.id === attr.attributeValue.id
                ? { ...val, available: true }
                : val
            );
          }
        });
      });

      const attributes = Object.values(attributeMap).filter(
        (attr) => attr.values.length > 0
      );

      return {
        ...product,
        attributes,
      };
    }),
});
