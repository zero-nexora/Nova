import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { GetInfiniteProductsSchema, ProductDetail } from "./types";

export const productsRouter = createTRPCRouter({
  getAll: baseProcedure
    .input(GetInfiniteProductsSchema)
    .query(async ({ input, ctx }) => {
      const {
        limit,
        cursor,
        search,
        slugCategory,
        slugSubcategory,
        sortOrder,
        priceMin,
        priceMax,
        excludeSlugs,
        sortBy,
      } = input;

      try {
        const where: any = {
          is_deleted: false,
          variants: {
            some: {
              stock_quantity: { gt: 0 },
            },
          },
        };

        if (search?.trim()) {
          const searchTerm = search.trim();
          where.OR = [
            { name: { contains: searchTerm, mode: "insensitive" } },
            { description: { contains: searchTerm, mode: "insensitive" } },
            { slug: { contains: searchTerm, mode: "insensitive" } },
            {
              category: {
                OR: [
                  { name: { contains: searchTerm, mode: "insensitive" } },
                  { slug: { contains: searchTerm, mode: "insensitive" } },
                ],
              },
            },
            {
              subcategory: {
                OR: [
                  { name: { contains: searchTerm, mode: "insensitive" } },
                  { slug: { contains: searchTerm, mode: "insensitive" } },
                ],
              },
            },
          ];
        }

        if (slugCategory) {
          where.category = { is: { slug: slugCategory } };
        }

        if (slugSubcategory) {
          where.subcategory = { is: { slug: slugSubcategory } };
        }

        if (priceMin !== undefined || priceMax !== undefined) {
          const priceFilters: any[] = [];
          if (priceMin !== undefined && priceMin >= 0) {
            priceFilters.push({ price: { gte: priceMin } });
          }
          if (priceMax !== undefined && priceMax >= 0) {
            priceFilters.push({ price: { lte: priceMax } });
          }
          if (priceFilters.length > 0) {
            where.variants = {
              some: {
                stock_quantity: { gt: 0 },
                AND: priceFilters,
              },
            };
          }
        }

        if (excludeSlugs && excludeSlugs.length > 0) {
          where.slug = { notIn: excludeSlugs };
        }

        if (cursor) {
          const cursorFilter =
            sortOrder === "desc"
              ? {
                  OR: [
                    { updated_at: { lt: cursor.updatedAt } },
                    {
                      AND: [
                        { updated_at: cursor.updatedAt },
                        { id: { lt: cursor.id } },
                      ],
                    },
                  ],
                }
              : {
                  OR: [
                    { updated_at: { gt: cursor.updatedAt } },
                    {
                      AND: [
                        { updated_at: cursor.updatedAt },
                        { id: { gt: cursor.id } },
                      ],
                    },
                  ],
                };

          where.AND = [...(where.AND || []), cursorFilter];
        }

        let orderBy: any = {};
        if (sortBy === "price") {
          orderBy = {
            variants: {
              _min: {
                price: sortOrder || "asc",
              },
            },
          };
        } else if (sortBy === "name") {
          orderBy = { name: sortOrder || "asc" };
        } else if (sortBy === "updated_at") {
          orderBy = { updated_at: sortOrder || "desc" };
        } else {
          orderBy = { updated_at: "desc" };
        }

        // query chính
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
            category: { select: { id: true, name: true, slug: true } },
            subcategory: { select: { id: true, name: true, slug: true } },
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
            _count: { select: { reviews: true, variants: true } },
          },
        });

        // phân trang
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
        slugCategory: z.string().min(1, "Category slug is required"),
      })
    )
    .query(async ({ input, ctx }) => {
      const { slugCategory } = input;
      const products = await ctx.db.products.findMany({
        where: {
          category: {
            slug: slugCategory,
          },
          is_deleted: false,
          variants: {
            some: {
              stock_quantity: {
                gt: 0,
              },
            },
          },
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
          variants: {
            some: {
              stock_quantity: {
                gt: 0,
              },
            },
          },
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

  getSuggest: baseProcedure
    .input(
      z.object({
        search: z.string().min(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const { search } = input;

      if (!search.trim()) return [];

      const categories = await ctx.db.categories.findMany({
        where: {
          is_deleted: false,
          OR: [
            {
              name: {
                contains: search,
                mode: "insensitive",
              },
              slug: {
                contains: search,
                mode: "insensitive",
              },
            },
          ],
        },
        select: {
          name: true,
        },
        take: 5,
      });

      const subcategories = await ctx.db.subcategories.findMany({
        where: {
          is_deleted: false,
          OR: [
            {
              name: {
                contains: search,
                mode: "insensitive",
              },
              slug: {
                contains: search,
                mode: "insensitive",
              },
            },
          ],
        },
        select: {
          name: true,
        },
        take: 5,
      });

      const products = await ctx.db.products.findMany({
        where: {
          is_deleted: false,
          OR: [
            {
              name: {
                contains: search,
                mode: "insensitive",
              },
              slug: {
                contains: search,
                mode: "insensitive",
              },
              description: {
                contains: search,
                mode: "insensitive",
              },
            },
          ],
        },
        select: {
          name: true,
        },
        take: 5,
      });

      const suggestions = [
        ...categories.map((category) => category.name),
        ...subcategories.map((subcategory) => subcategory.name),
        ...products.map((product) => product.name),
      ];

      return suggestions || [];
    }),
});
