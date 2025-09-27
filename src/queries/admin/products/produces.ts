import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { adminOrManageProductProcedure, createTRPCRouter } from "@/trpc/init";
import {
  CreateProductSchema,
  GetAllProductsSchema,
  ImageInput,
  UpdateProductSchema,
  VariantInput,
} from "./types";
import {
  buildProductOrderBy,
  buildProductWhereClause,
  createProductVariant,
  generateProductSlug,
  updateProductImages,
  updateProductVariants,
  validateProductDependencies,
  validateVariantData,
} from "./utils";
import { PrismaClient } from "@prisma/client";
import type { Prisma } from "@prisma/client";

export const productsRouter = createTRPCRouter({
  getAll: adminOrManageProductProcedure
    .input(GetAllProductsSchema)
    .query(async ({ input, ctx }) => {
      const { page, limit, sortBy, sortOrder, ...filters } = input;

      const where = buildProductWhereClause(filters);

      const orderBy = buildProductOrderBy(sortBy, sortOrder);

      const offset = (page - 1) * limit;

      const totalCount = await ctx.db.products.count({ where });

      const products = await ctx.db.products.findMany({
        where,
        take: limit,
        skip: offset,
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
                        select: { id: true, name: true },
                      },
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

      const totalPages = Math.ceil(totalCount / limit);
      const hasNextPage = page < totalPages;
      const hasPreviousPage = page > 1;

      return {
        products,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNextPage,
          hasPreviousPage,
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
    .input(CreateProductSchema)
    .mutation(async ({ input, ctx }) => {
      const { categoryId, images, name, variants, description, subcategoryId } =
        input;

      await validateProductDependencies(ctx.db, categoryId, subcategoryId);

      if (variants?.length) {
        await validateVariantData(ctx.db, variants);
      }

      const result = await ctx.db.$transaction(async (tx) => {
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
          select: {
            id: true,
            name: true,
          },
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

        if (variants?.length) {
          for (const variantData of variants) {
            await createProductVariant(tx, product.id, {
              ...variantData,
              attributeValueIds: variantData.attributeValueIds || [],
            });
          }
        }

        return product;
      });

      return {
        success: true,
        data: result,
      };
    }),

  update: adminOrManageProductProcedure
    .input(UpdateProductSchema)
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
                  product_variant_id: true,
                  attribute_value_id: true,
                  attributeValue: {
                    select: {
                      id: true,
                      value: true,
                      attribute_id: true,
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

      if (!existingProduct) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      if (categoryId || subcategoryId) {
        await validateProductDependencies(
          ctx.db,
          categoryId || existingProduct.category_id,
          subcategoryId
        );
      }

      if (variants?.length) {
        await validateVariantData(ctx.db, variants as VariantInput[], id);
      }

      const result = await ctx.db.$transaction(async (tx) => {
        const updateData: Prisma.ProductsUpdateInput = {
          updated_at: new Date(),
        };

        if (name !== undefined && name !== existingProduct.name) {
          updateData.name = name;
          updateData.slug = await generateProductSlug(
            tx as PrismaClient,
            name,
            existingProduct.id
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
          select: {
            id: true,
            name: true,
          },
        });

        if (images) {
          await updateProductImages(
            tx,
            id,
            images as ImageInput[],
            existingProduct.images
          );
        }

        if (variants?.length) {
          await updateProductVariants(
            tx,
            id,
            variants as VariantInput[],
            existingProduct.variants
          );
        }

        return product;
      });

      return {
        success: true,
        data: result,
      };
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
