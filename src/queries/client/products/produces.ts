import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { ProductDetail } from "./types";
import { DEFAULT_LIMIT } from "@/lib/constants";
import { auth } from "@clerk/nextjs/server";

export const productsRouter = createTRPCRouter({
  getAll: baseProcedure
    .input(
      z.object({
        limit: z.number().default(DEFAULT_LIMIT),
        cursor: z
          .object({
            id: z.string().uuid(),
            updatedAt: z.date(),
          })
          .nullish(),
        search: z.string().optional(),
        slugCategories: z.array(z.string()).optional(),
        slugSubcategories: z.array(z.string()).optional(),
        sortBy: z
          .enum([
            "curated",
            "trending",
            "hot_and_new",
            "price_asc",
            "price_desc",
            "name_asc",
            "name_desc",
            "newest",
            "oldest",
            "stock_high",
            "stock_low",
            "rating_high",
          ])
          .default("curated"),
        sortOrder: z.enum(["asc", "desc"]).default("desc"),
        priceMin: z.number().min(1).optional(),
        priceMax: z.number().min(1).optional(),
        excludeSlugs: z.array(z.string()).optional(),
        wishlist: z.boolean().optional().default(false),
      })
    )
    .query(async ({ input, ctx }) => {
      const {
        limit,
        cursor,
        search,
        slugCategories,
        slugSubcategories,
        sortBy,
        sortOrder,
        priceMin,
        priceMax,
        excludeSlugs,
        wishlist,
      } = input;
      const { db } = ctx;
      const { userId } = await auth();

      try {
        const where: any = {
          is_deleted: false,
          variants: {
            some: { stock_quantity: { gt: 0 } },
          },
        };

        // Add wishlist filter if wishlist is true
        if (wishlist) {
          if (!userId) {
            throw new TRPCError({
              code: "UNAUTHORIZED",
              message: "Access denied. User session not found.",
            });
          }

          // Fetch user by clerkId
          const user = await db.users.findUnique({
            where: { clerkId: userId },
            select: { id: true },
          });

          if (!user) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "User not found",
            });
          }

          where.wishlist = {
            user_id: user.id,
          };
        }

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

        if (slugCategories && slugCategories.length > 0) {
          where.category = {
            slug: { in: slugCategories },
          };
        }

        if (slugSubcategories && slugSubcategories.length > 0) {
          where.subcategory = {
            slug: { in: slugSubcategories },
          };
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

        let orderBy: any = undefined;

        switch (sortBy) {
          case "price_asc":
            orderBy = { updated_at: "asc" };
            break;
          case "price_desc":
            orderBy = { updated_at: "desc" };
            break;
          case "newest":
            orderBy = { created_at: "desc" };
            break;
          case "oldest":
            orderBy = { created_at: "asc" };
            break;
          default:
            orderBy = { updated_at: "desc" };
            break;
        }

        const products = await db.products.findMany({
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
              orderBy: { updated_at: "asc" },
              take: 1,
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
              orderBy: {
                price:
                  sortBy === "price_asc"
                    ? "asc"
                    : sortBy === "price_desc"
                    ? "desc"
                    : "asc",
              },
            },
            wishlist: {
              // Updated to singular wishlist
              select: {
                id: true,
                user_id: true, // Include user_id to verify wishlist ownership
              },
            },
            _count: { select: { reviews: true, variants: true } },
          },
        });

        const hasMore = products?.length > limit;
        const items = hasMore ? products.slice(0, -1) : products;
        const lastItem = items[items.length - 1];
        const nextCursor = hasMore
          ? { id: lastItem.id, updatedAt: lastItem.updated_at }
          : null;

        return { products: items, nextCursor, hasMore };
      } catch (error) {
        console.error("Error fetching infinite products:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch products",
        });
      }
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
                gte: 0,
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
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          wishlist: {
            select: {
              id: true,
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
          values: Set<string>;
          valueDetails: Map<string, { id: string; value: string }>;
        }
      > = {};

      // Include all variants, regardless of stock_quantity
      product.variants.forEach((variant) => {
        variant.attributes.forEach((attr) => {
          const attribute = attr.attributeValue.attribute;
          const attributeId = attribute.id;
          const valueId = attr.attributeValue.id;

          if (!attributeMap[attributeId]) {
            attributeMap[attributeId] = {
              id: attributeId,
              name: attribute.name,
              values: new Set(),
              valueDetails: new Map(),
            };
          }

          attributeMap[attributeId].values.add(valueId);

          if (!attributeMap[attributeId].valueDetails.has(valueId)) {
            attributeMap[attributeId].valueDetails.set(valueId, {
              id: valueId,
              value: attr.attributeValue.value,
            });
          }
        });
      });

      const attributes = Object.values(attributeMap).map((attr) => ({
        id: attr.id,
        name: attr.name,
        values: Array.from(attr.valueDetails.values()),
      }));

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
            },
            {
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
            },
            {
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
            },
            {
              slug: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
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
