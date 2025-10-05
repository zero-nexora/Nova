import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { adminOrManageProductProcedure, createTRPCRouter } from "@/trpc/init";
import { generateProductSlug } from "./utils";
import { PrismaClient } from "@prisma/client";
import type { Prisma } from "@prisma/client";

export const isDeletedValues = ["true", "false", "all"] as const;

export const productsRouter = createTRPCRouter({
  getAll: adminOrManageProductProcedure
    .input(
    z.object({
      limit: z.number().int().positive().default(10),
      page: z.number().int().positive().default(1),
      search: z.string().optional(),
      slugCategory: z.string().optional(),
      slugSubcategory: z.string().optional(),
      isDeleted: z.enum(isDeletedValues).optional(),
      priceMin: z.number().nonnegative().optional(),
      priceMax: z.number().nonnegative().optional(),
    })
  )
  .query(async ({ input, ctx }) => {
    const {
      page,
      limit,
      search,
      slugCategory,
      slugSubcategory,
      isDeleted,
      priceMin,
      priceMax,
    } = input;

    const where: Prisma.ProductsWhereInput = {};

    if (search?.trim()) {
      where.OR = [
        { name: { contains: search.trim(), mode: "insensitive" } },
        { description: { contains: search.trim(), mode: "insensitive" } },
        { slug: { contains: search.trim(), mode: "insensitive" } },
      ];
    }

    if (slugCategory) {
      where.category = { is: { slug: slugCategory } };
    }

    if (slugSubcategory) {
      where.subcategory = { is: { slug: slugSubcategory } };
    }

    if (isDeleted === "true") {
      where.is_deleted = true;
    } else if (isDeleted === "false") {
      where.is_deleted = false;
    }

    if (priceMin !== undefined || priceMax !== undefined) {
      const priceFilters: Prisma.Product_VariantsWhereInput[] = [];
      if (priceMin !== undefined && priceMin >= 0) {
        priceFilters.push({ price: { gte: priceMin } });
      }
      if (priceMax !== undefined && priceMax >= 0) {
        priceFilters.push({ price: { lte: priceMax } });
      }
      if (priceFilters.length > 0) {
        where.variants = { some: { AND: priceFilters } };
      }
    }

    const offset = (page - 1) * limit;
    const totalCount = await ctx.db.products.count({ where });

    const products = await ctx.db.products.findMany({
      where,
      take: limit,
      skip: offset,
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

    const totalPages = Math.ceil(totalCount / limit);
    return {
      products,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
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
            orderBy: { created_at: "asc" },
          },
          variants: {
            select: {
              id: true,
              price: true,
              stock_quantity: true,
            },
            orderBy: { price: "asc" },
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

  getAllProductAttributes: adminOrManageProductProcedure.query(
    async ({ ctx }) => {
      const productAttributes = await ctx.db.product_Attributes.findMany({
        where: { is_deleted: false },
        select: {
          id: true,
          name: true,
          values: {
            select: {
              id: true,
              value: true,
            },
            where: { is_deleted: false },
            orderBy: { value: "asc" },
          },
        },
        orderBy: { name: "asc" },
      });

      return productAttributes;
    }
  ),

  create: adminOrManageProductProcedure
    .input(
      z.object({
        name: z.string().min(1, "Product name is required"),
        description: z.string().optional(),
        categoryId: z.string().uuid("Invalid category id"),
        subcategoryId: z.string().uuid("Invalid subcategory id").optional(),
        images: z
          .array(
            z.object({
              image_url: z.string().url("Invalid image URL format"),
              public_id: z.string().min(1, "Public ID is required"),
            })
          )
          .optional(),
        // .min(1, "At least one product image is required"),
        variants: z
          .array(
            z.object({
              sku: z.string().min(1, "SKU is required"),
              price: z.number().positive("Price must be positive"),
              stock_quantity: z
                .number()
                .int("Stock must be an integer")
                .nonnegative("Stock must be >= 0"),
              attributeValueIds: z
                .array(z.string().uuid("Invalid attribute value id"))
                .min(1, "At least one attribute value ID is required"),
            })
          )
          .optional(),
        // .min(1, "At least one variant is required"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { categoryId, images, name, variants, description, subcategoryId } =
        input;

      // Validate category and subcategory
      const category = await ctx.db.categories.findFirst({
        where: { id: categoryId, is_deleted: false },
        select: { id: true },
      });

      if (!category) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found or has been deleted",
        });
      }

      if (subcategoryId) {
        const subcategory = await ctx.db.subcategories.findFirst({
          where: {
            id: subcategoryId,
            category_id: categoryId,
            is_deleted: false,
          },
          select: { id: true },
        });

        if (!subcategory) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message:
              "Subcategory not found, deleted, or doesn't belong to the specified category",
          });
        }
      }

      // Validate variant data
      if (variants?.length) {
        const allAttributeValueIds = [
          ...new Set(variants.flatMap((v) => v.attributeValueIds)),
        ];

        if (allAttributeValueIds.length > 0) {
          const attributeValues =
            await ctx.db.product_Attribute_Values.findMany({
              where: { id: { in: allAttributeValueIds }, is_deleted: false },
              select: { id: true },
            });

          if (attributeValues.length !== allAttributeValueIds.length) {
            const foundIds = attributeValues.map((av) => av.id);
            const missingIds = allAttributeValueIds.filter(
              (id) => !foundIds.includes(id)
            );
            throw new TRPCError({
              code: "NOT_FOUND",
              message: `Some attribute values not found or have been deleted: ${missingIds.join(
                ", "
              )}`,
            });
          }
        }

        const skuList = variants.map((v) => v.sku);
        const uniqueSkus = [...new Set(skuList)];

        if (uniqueSkus.length !== skuList.length) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Duplicate SKUs found in variant data",
          });
        }

        const existingVariants = await ctx.db.product_Variants.findMany({
          where: { sku: { in: skuList } },
          select: { sku: true },
        });

        if (existingVariants.length > 0) {
          const existingSkus = existingVariants.map((v) => v.sku);
          throw new TRPCError({
            code: "CONFLICT",
            message: `SKU(s) already exist: ${existingSkus.join(", ")}`,
          });
        }

        const invalidVariants = variants.filter(
          (v) => v.price < 0 || v.stock_quantity < 0
        );
        if (invalidVariants.length > 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Price and stock quantity must be non-negative",
          });
        }
      }

      // Merge variants with duplicate attributeValueIds
      let uniqueVariants = variants || [];
      if (variants?.length) {
        const uniqueVariantsMap = new Map<string, (typeof variants)[0]>();
        variants.forEach((variant) => {
          const key = variant.attributeValueIds.sort().join(",");
          uniqueVariantsMap.set(key, variant);
        });
        uniqueVariants = Array.from(uniqueVariantsMap.values());

        if (uniqueVariants.length < variants.length) {
          await ctx.db.$executeRaw`SELECT 1`; // Dummy query to satisfy transaction
        }
      }

      return await ctx.db.$transaction(async (tx) => {
        const slug = await generateProductSlug(tx as PrismaClient, name);

        const productData: Prisma.ProductsCreateInput = {
          name,
          slug,
          description: description || null,
          category: { connect: { id: categoryId } },
          ...(subcategoryId && {
            subcategory: { connect: { id: subcategoryId } },
          }),
        };

        const product = await tx.products.create({
          data: productData,
          select: { id: true, name: true },
        });

        if (images?.length) {
          await tx.product_Images.createMany({
            data: images.map((img) => ({
              product_id: product.id,
              image_url: img.image_url || "",
              public_id: img.public_id || "",
            })),
          });
        }

        if (uniqueVariants.length) {
          for (const variantData of uniqueVariants) {
            const variant = await tx.product_Variants.create({
              data: {
                product_id: product.id,
                sku: variantData.sku,
                price: variantData.price,
                stock_quantity: variantData.stock_quantity,
              },
              select: {
                id: true,
                sku: true,
                price: true,
                stock_quantity: true,
              },
            });

            if (variantData.attributeValueIds?.length) {
              await tx.product_Variant_Attributes.createMany({
                data: variantData.attributeValueIds.map(
                  (attrValueId: string) => ({
                    product_variant_id: variant.id,
                    attribute_value_id: attrValueId,
                  })
                ),
              });
            }
          }
        }

        return { success: true, data: product };
      });
    }),
  update: adminOrManageProductProcedure
    .input(
      z.object({
        id: z.string().uuid("Invalid product id"),
        name: z.string().min(1, "Product name is required").optional(),
        description: z.string().optional(),
        categoryId: z.string().uuid("Invalid category id").optional(),
        subcategoryId: z.string().uuid("Invalid subcategory id").optional(),
        images: z
          .array(
            z.object({
              id: z.string().uuid().optional(),
              image_url: z.string().url("Invalid image URL format"),
              public_id: z.string().min(1),
            })
          )
          .optional(),
        variants: z
          .array(
            z.object({
              id: z.string().uuid().optional(),
              sku: z.string().min(1, "SKU is required"),
              price: z.number().positive("Price must be positive"),
              stock_quantity: z
                .number()
                .int()
                .nonnegative("Stock must be >= 0"),
              attributeValueIds: z
                .array(z.string().uuid("Invalid attribute value id"))
                .min(1, "Each variant must have at least one attribute"),
            })
          )
          .optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const {
        id,
        categoryId,
        description,
        images,
        name,
        subcategoryId,
        variants,
      } = input;

      const existingProduct = await ctx.db.products.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          category_id: true,
          images: { select: { id: true, image_url: true, public_id: true } },
          variants: {
            select: {
              id: true,
              sku: true,
              price: true,
              stock_quantity: true,
              attributes: {
                select: {
                  id: true,
                  product_variant_id: true,
                  attribute_value_id: true,
                  attributeValue: {
                    select: {
                      id: true,
                      value: true,
                      attribute_id: true,
                      attribute: { select: { id: true, name: true } },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!existingProduct) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      if (categoryId || subcategoryId) {
        const category = await ctx.db.categories.findFirst({
          where: {
            id: categoryId || existingProduct.category_id,
            is_deleted: false,
          },
          select: { id: true },
        });

        if (!category) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Category not found or has been deleted",
          });
        }

        if (subcategoryId) {
          const subcategory = await ctx.db.subcategories.findFirst({
            where: {
              id: subcategoryId,
              category_id: categoryId || existingProduct.category_id,
              is_deleted: false,
            },
            select: { id: true },
          });

          if (!subcategory) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message:
                "Subcategory not found, deleted, or doesn't belong to the specified category",
            });
          }
        }
      }

      if (variants?.length) {
        const allAttributeValueIds = [
          ...new Set(variants.flatMap((v) => v.attributeValueIds)),
        ];

        if (allAttributeValueIds.length > 0) {
          const attributeValues =
            await ctx.db.product_Attribute_Values.findMany({
              where: { id: { in: allAttributeValueIds }, is_deleted: false },
              select: { id: true },
            });

          if (attributeValues.length !== allAttributeValueIds.length) {
            const foundIds = attributeValues.map((av) => av.id);
            const missingIds = allAttributeValueIds.filter(
              (id) => !foundIds.includes(id)
            );
            throw new TRPCError({
              code: "NOT_FOUND",
              message: `Some attribute values not found or have been deleted: ${missingIds.join(
                ", "
              )}`,
            });
          }
        }

        const skuList = variants.map((v) => v.sku);
        const uniqueSkus = [...new Set(skuList)];

        if (uniqueSkus.length !== skuList.length) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Duplicate SKUs found in variant data",
          });
        }

        const whereClause: Prisma.Product_VariantsWhereInput = {
          sku: { in: skuList },
          product: { NOT: { id } },
        };

        const existingVariants = await ctx.db.product_Variants.findMany({
          where: whereClause,
          select: { sku: true },
        });

        if (existingVariants.length > 0) {
          const existingSkus = existingVariants.map((v) => v.sku);
          throw new TRPCError({
            code: "CONFLICT",
            message: `SKU(s) already exist: ${existingSkus.join(", ")}`,
          });
        }

        const invalidVariants = variants.filter(
          (v) => v.price < 0 || v.stock_quantity < 0
        );
        if (invalidVariants.length > 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Price and stock quantity must be non-negative",
          });
        }
      }

      return await ctx.db.$transaction(async (tx) => {
        const updateData: Prisma.ProductsUpdateInput = {
          updated_at: new Date(),
        };

        if (name !== undefined && name !== existingProduct.name) {
          updateData.name = name;
          updateData.slug = await generateProductSlug(
            tx as PrismaClient,
            name,
            id
          );
        }

        if (description !== undefined) {
          updateData.description = description;
        }

        if (
          categoryId !== undefined &&
          categoryId !== existingProduct.category_id
        ) {
          updateData.category = { connect: { id: categoryId } };
        }

        if (subcategoryId !== undefined) {
          updateData.subcategory = subcategoryId
            ? { connect: { id: subcategoryId } }
            : { disconnect: true };
        }

        const product = await tx.products.update({
          where: { id },
          data: updateData,
          select: { id: true, name: true },
        });

        if (images?.length) {
          const existingPublicIds = new Set(
            existingProduct.images.map((img) => img.public_id)
          );
          const imagesToCreate = images.filter(
            (img) =>
              img.public_id.trim() && !existingPublicIds.has(img.public_id)
          );

          if (imagesToCreate.length > 0) {
            await tx.product_Images.createMany({
              data: imagesToCreate.map((image) => ({
                product_id: id,
                image_url: image.image_url,
                public_id: image.public_id,
              })),
            });
          }
        }

        if (variants) {
          const uniqueVariantsMap = new Map<string, (typeof variants)[0]>();
          variants.forEach((variant) => {
            const key = variant.attributeValueIds.sort().join(",");
            uniqueVariantsMap.set(key, variant);
          });

          const uniqueVariants = Array.from(uniqueVariantsMap.values());

          if (uniqueVariants.length < variants.length) {
            await ctx.db.$executeRaw`SELECT 1`; // Dummy query to satisfy transaction
          }

          if (!uniqueVariants.length && existingProduct.variants.length > 0) {
            await tx.product_Variants.deleteMany({
              where: { id: { in: existingProduct.variants.map((v) => v.id) } },
            });
          } else if (uniqueVariants.length) {
            const existingVariantIds = new Set(
              existingProduct.variants.map((v) => v.id)
            );
            const newVariantIds = new Set(
              uniqueVariants.filter((v) => v.id).map((v) => v.id!)
            );

            const variantsToDelete = existingProduct.variants.filter(
              (v) => !newVariantIds.has(v.id)
            );
            if (variantsToDelete.length > 0) {
              await tx.product_Variants.deleteMany({
                where: { id: { in: variantsToDelete.map((v) => v.id) } },
              });
            }

            for (const variant of uniqueVariants) {
              if (variant.id && existingVariantIds.has(variant.id)) {
                await tx.product_Variants.update({
                  where: { id: variant.id },
                  data: {
                    sku: variant.sku,
                    price: variant.price,
                    stock_quantity: variant.stock_quantity,
                    updated_at: new Date(),
                  },
                });

                await tx.product_Variant_Attributes.deleteMany({
                  where: { product_variant_id: variant.id },
                });

                if (variant.attributeValueIds.length > 0) {
                  await tx.product_Variant_Attributes.createMany({
                    data: variant.attributeValueIds.map(
                      (attrValueId: string) => ({
                        product_variant_id: variant.id!,
                        attribute_value_id: attrValueId,
                      })
                    ),
                  });
                }
              } else {
                const newVariant = await tx.product_Variants.create({
                  data: {
                    product_id: id,
                    sku: variant.sku,
                    price: variant.price,
                    stock_quantity: variant.stock_quantity,
                  },
                });

                if (variant.attributeValueIds.length > 0) {
                  await tx.product_Variant_Attributes.createMany({
                    data: variant.attributeValueIds.map(
                      (attrValueId: string) => ({
                        product_variant_id: newVariant.id,
                        attribute_value_id: attrValueId,
                      })
                    ),
                  });
                }
              }
            }
          }
        }

        return { success: true, data: product };
      });
    }),

  toggleDeleted: adminOrManageProductProcedure
    .input(z.object({ id: z.string().uuid("Invalid product id") }))
    .mutation(async ({ input, ctx }) => {
      const { id } = input;

      const product = await ctx.db.products.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          is_deleted: true,
          category: {
            select: {
              id: true,
              is_deleted: true,
            },
          },
          subcategory: {
            select: {
              id: true,
              is_deleted: true,
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

      if (product.category.is_deleted || product.subcategory?.is_deleted) {
        throw new TRPCError({
          code: "CONFLICT",
          message:
            "Cannot toggle product status because its category or subcategory has been deleted.",
        });
      }

      const newDeletedStatus = !product.is_deleted;

      const updatedProduct = await ctx.db.products.update({
        where: { id },
        data: {
          is_deleted: newDeletedStatus,
          deleted_at: newDeletedStatus ? new Date() : null,
          updated_at: new Date(),
        },
        select: {
          id: true,
          name: true,
          is_deleted: true,
        },
      });

      return {
        success: true,
        data: updatedProduct,
        action: newDeletedStatus ? "deleted" : "restored",
      };
    }),

  toggleDeletedMultiple: adminOrManageProductProcedure
    .input(
      z.object({
        ids: z.array(z.string().uuid("Invalid product id")),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { ids } = input;

      if (!ids.length) {
        return {
          success: true,
          count: 0,
          data: [],
          notFoundIds: [],
          skippedIds: [],
        };
      }

      const products = await ctx.db.products.findMany({
        where: { id: { in: ids } },
        select: {
          id: true,
          name: true,
          is_deleted: true,
          category: {
            select: {
              id: true,
              is_deleted: true,
            },
          },
          subcategory: {
            select: {
              id: true,
              is_deleted: true,
            },
          },
        },
      });

      if (!products.length) {
        return {
          success: true,
          count: 0,
          data: [],
          notFoundIds: ids,
          skippedIds: [],
        };
      }

      const updatedProducts = [];
      const skippedIds = [];

      for (const product of products) {
        if (product.category.is_deleted || product.subcategory?.is_deleted) {
          skippedIds.push({
            id: product.id,
            name: product.name,
            reason: "Category or subcategory is deleted",
          });
          continue;
        }

        const newDeletedStatus = !product.is_deleted;

        const updatedProduct = await ctx.db.products.update({
          where: { id: product.id },
          data: {
            is_deleted: newDeletedStatus,
            deleted_at: newDeletedStatus ? new Date() : null,
            updated_at: new Date(),
          },
          select: {
            id: true,
            name: true,
            is_deleted: true,
          },
        });

        updatedProducts.push({
          ...updatedProduct,
          action: newDeletedStatus ? "deleted" : "restored",
        });
      }

      const foundIds = products.map((product) => product.id);
      const notFoundIds = ids.filter((id) => !foundIds.includes(id));

      return {
        success: true,
        count: updatedProducts.length,
        data: updatedProducts,
        notFoundIds,
        skippedIds,
      };
    }),

  delete: adminOrManageProductProcedure
    .input(z.object({ id: z.string().uuid("Invalid product id") }))
    .mutation(async ({ input, ctx }) => {
      const { id } = input;

      const product = await ctx.db.products.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          variants: {
            select: {
              id: true,
              _count: {
                select: {
                  cartItems: true,
                  wishlists: true,
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

      const result = await ctx.db.$transaction(async (tx) => {
        const variantIds = product.variants.map((v) => v.id);

        if (variantIds.length) {
          await tx.cart_Items.deleteMany({
            where: { product_variant_id: { in: variantIds } },
          });

          await tx.wishlists.deleteMany({
            where: { product_variant_id: { in: variantIds } },
          });
        }

        const deletedProduct = await tx.products.delete({
          where: { id },
          select: {
            id: true,
            name: true,
          },
        });

        return deletedProduct;
      });

      return {
        success: true,
        data: result,
      };
    }),

  deleteMultiple: adminOrManageProductProcedure
    .input(
      z.object({
        ids: z.array(z.string().uuid("Invalid product id")),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { ids } = input;

      if (!ids.length) {
        return {
          success: true,
          count: 0,
          deletedProducts: [],
          notFoundIds: [],
        };
      }

      const products = await ctx.db.products.findMany({
        where: { id: { in: ids } },
        select: {
          id: true,
          name: true,
          variants: {
            select: {
              id: true,
              _count: {
                select: {
                  cartItems: true,
                  wishlists: true,
                },
              },
            },
          },
        },
      });

      if (!products.length) {
        return {
          success: true,
          count: 0,
          deletedProducts: [],
          notFoundIds: ids,
        };
      }

      let deletedProducts: Array<{ id: string; name: string }> = [];

      if (products.length > 0) {
        deletedProducts = await ctx.db.$transaction(async (tx) => {
          for (const product of products) {
            const variantIds = product.variants.map((v) => v.id);

            if (variantIds.length) {
              await tx.cart_Items.deleteMany({
                where: { product_variant_id: { in: variantIds } },
              });

              await tx.wishlists.deleteMany({
                where: { product_variant_id: { in: variantIds } },
              });
            }
          }

          // Delete products
          const deleted = [];
          for (const product of products) {
            const deletedProduct = await tx.products.delete({
              where: { id: product.id },
              select: {
                id: true,
                name: true,
              },
            });
            deleted.push(deletedProduct);
          }

          return deleted;
        });
      }

      const foundIds = products.map((product) => product.id);
      const notFoundIds = ids.filter((id) => !foundIds.includes(id));

      return {
        success: true,
        count: deletedProducts.length,
        deletedProducts,
        notFoundIds,
      };
    }),
});
