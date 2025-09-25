import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  adminOrManageProductProcedure,
  baseProcedure,
  createTRPCRouter,
} from "@/trpc/init";
import {
  GetInfiniteProductsResponse,
  GetInfiniteProductsSchema,
} from "./types";
import { buildProductOrderBy, buildProductWhereClause } from "./utils";

export const productsRouter = createTRPCRouter({
  getAll: baseProcedure
    .input(GetInfiniteProductsSchema)
    .query(async ({ input, ctx }): Promise<GetInfiniteProductsResponse> => {
      const {
        limit,
        cursor,
        search,
        categoryId,
        subcategoryId,
        sortBy,
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
            where.id = { lt: cursor };
          } else {
            where.id = { gt: cursor };
          }
        }

        const orderBy = buildProductOrderBy(sortBy, sortOrder);

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
              orderBy: { price: "asc" },
            },
            _count: {
              select: {
                reviews: true,
                variants: true,
              },
            },
          },
        });

        const hasMore = products.length > limit;
        const returnedProducts = hasMore ? products.slice(0, -1) : products;

        const nextCursor = hasMore
          ? returnedProducts[returnedProducts.length - 1]?.id
          : undefined;

        return {
          products: returnedProducts,
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

  getByCategory: adminOrManageProductProcedure
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
});
