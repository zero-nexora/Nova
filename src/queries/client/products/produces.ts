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
        sortBy,
        sortOrder,
        priceMin,
        priceMax,
        excludeSlugs,
      } = input;

      try {
        const where: any = {
          is_deleted: false,
          variants: {
            some: { stock_quantity: { gt: 0 } },
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
        switch (sortBy) {
          case "price_asc":
            orderBy = { variants: { _min: { price: "asc" } } };
            break;
          case "price_desc":
            orderBy = { variants: { _min: { price: "desc" } } };
            break;
          case "name_asc":
            orderBy = { name: "asc" };
            break;
          case "name_desc":
            orderBy = { name: "desc" };
            break;
          case "newest":
            orderBy = { updated_at: "desc" };
            break;
          case "oldest":
            orderBy = { updated_at: "asc" };
            break;
          case "stock_high":
            orderBy = { variants: { _sum: { stock_quantity: "desc" } } };
            break;
          case "stock_low":
            orderBy = { variants: { _sum: { stock_quantity: "asc" } } };
            break;
          case "rating_high":
            orderBy = { reviews: { _avg: { rating: "desc" } } };
            break;
          default:
            orderBy = { updated_at: sortOrder || "desc" };
            break;
        }

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
              orderBy: { price: "asc" },
            },
            _count: { select: { reviews: true, variants: true } },
          },
        });

        const hasMore = products.length > limit;
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

      // Build attribute map from variants that have stock
      const attributeMap: Record<
        string,
        {
          id: string;
          name: string;
          values: Set<string>; // Set of value IDs
          valueDetails: Map<string, { id: string; value: string }>; // Map of value ID to details
        }
      > = {};

      // Only process variants with stock > 0
      const variantsWithStock = product.variants.filter(
        (v) => v.stock_quantity > 0
      );

      variantsWithStock.forEach((variant) => {
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

          // Add value ID to the set
          attributeMap[attributeId].values.add(valueId);

          // Store value details
          if (!attributeMap[attributeId].valueDetails.has(valueId)) {
            attributeMap[attributeId].valueDetails.set(valueId, {
              id: valueId,
              value: attr.attributeValue.value,
            });
          }
        });
      });

      // Convert to array format with only available values
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

  // nó bị bug nếu có 1 variant có 3 attribute thì nó bắt phải chọn 3 attribute cho tất cả variant mới add to cart đc mà các attribute khác disable rồi, khoong chọn đc, nhưng tôi muốn nếu variant chỉ có 1 attribute thì chỉ cần chọn value của attribute đó là có thể add to cart, add to cart theo từng variant, logic khác còn lại của code tôi gửi thì giữ nguyên, code đầy đủ lại Ui và server theo ý tưởng mô tả trên

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
