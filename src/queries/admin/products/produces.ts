import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { adminOrManageProductProcedure, createTRPCRouter } from "@/trpc/init";
import {
  CreateProductSchema,
  GetAllProductsSchema,
  UpdateProductSchema,
} from "./types";
import {
  buildProductOrderBy,
  buildProductWhereClause,
  createProductVariant,
  generateProductSlug,
  getDetailedProductIncludeOptions,
  getProductIncludeOptions,
  updateProductImages,
  updateProductVariants,
  validateProductDependencies,
  validateVariantData,
} from "./utils";
import { PrismaClient } from "@prisma/client";
import type { Prisma } from "@prisma/client";

export const productsRouter = createTRPCRouter({
  // Get all products with filtering, search, pagination
  getAll: adminOrManageProductProcedure
    .input(GetAllProductsSchema)
    .query(async ({ input, ctx }) => {
      const {
        page,
        limit,
        search,
        categoryId,
        subcategoryId,
        isDeleted,
        sortBy,
        sortOrder,
        priceMin,
        priceMax,
      } = input;

      try {
        const skip = (page - 1) * limit;
        const where = buildProductWhereClause({
          search,
          categoryId,
          subcategoryId,
          isDeleted,
          priceMin,
          priceMax,
        });

        const orderBy = buildProductOrderBy(sortBy, sortOrder);

        const [products, totalCount] = await Promise.all([
          ctx.db.products.findMany({
            where,
            skip,
            take: limit,
            orderBy,
            include: getProductIncludeOptions(),
          }),
          ctx.db.products.count({ where }),
        ]);

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
      } catch (error) {
        console.error("Error fetching products:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch products",
        });
      }
    }),

  // Get product by ID
  getById: adminOrManageProductProcedure
    .input(z.object({ id: z.string().uuid("Invalid product id") }))
    .query(async ({ input, ctx }) => {
      try {
        const product = await ctx.db.products.findFirst({
          where: {
            id: input.id,
            is_deleted: false, // Only return non-deleted products by default
          },
          include: getDetailedProductIncludeOptions(),
        });

        if (!product) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Product not found",
          });
        }

        return product;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error fetching product:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch product",
        });
      }
    }),

  // Get product by slug
  getBySlug: adminOrManageProductProcedure
    .input(z.object({ slug: z.string().min(1, "Slug is required") }))
    .query(async ({ input, ctx }) => {
      try {
        const product = await ctx.db.products.findFirst({
          where: {
            slug: input.slug,
            is_deleted: false,
          },
          include: getDetailedProductIncludeOptions(),
        });

        if (!product) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Product not found",
          });
        }

        return product;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error fetching product by slug:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch product",
        });
      }
    }),

  // Create product
  create: adminOrManageProductProcedure
    .input(CreateProductSchema)
    .mutation(async ({ input, ctx }) => {
      const { categoryId, images, name, variants, description, subcategoryId } =
        input;

      try {
        // Validate dependencies
        await validateProductDependencies(ctx.db, categoryId, subcategoryId);
        await validateVariantData(ctx.db, variants);

        // Create product with transaction
        const result = await ctx.db.$transaction(async (tx) => {
          // Generate unique slug
          const slug = await generateProductSlug(tx as PrismaClient, name);

          // Create product
          const product = await tx.products.create({
            data: {
              name,
              slug,
              description,
              category_id: categoryId,
              subcategory_id: subcategoryId,
            },
          });

          // Create images
          if (images.length > 0) {
            await tx.product_Images.createMany({
              data: images.map((img) => ({
                product_id: product.id,
                image_url: img.image_url || "",
                public_id: img.public_id || "",
              })),
            });
          }

          // Create variants with attributes
          for (const variantData of variants) {
            await createProductVariant(tx, product.id, variantData);
          }

          return product;
        });

        return {
          success: true,
          productId: result.id,
          message: "Product created successfully",
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error creating product:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create product",
        });
      }
    }),

  // Update product
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

      try {
        // Check if product exists and is not deleted
        const existingProduct = await ctx.db.products.findFirst({
          where: {
            id,
            is_deleted: false,
          },
          include: {
            images: true,
            variants: {
              where: { is_deleted: false },
              include: { attributes: true },
            },
          },
        });

        if (!existingProduct) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Product not found or has been deleted",
          });
        }

        // Validate dependencies if provided
        if (categoryId || subcategoryId) {
          await validateProductDependencies(
            ctx.db,
            categoryId || existingProduct.category_id,
            subcategoryId
          );
        }

        // Validate variant data if provided
        if (variants) {
          await validateVariantData(ctx.db, variants, id);
        }

        // Update product with transaction
        const result = await ctx.db.$transaction(async (tx) => {
          // Prepare update data
          const updateData: Prisma.ProductsUpdateInput = {
            updated_at: new Date(),
          };

          if (name !== undefined) {
            updateData.name = name;
            // Generate new slug if name changed
            if (name !== existingProduct.name) {
              updateData.slug = await generateProductSlug(
                tx as PrismaClient,
                name,
                existingProduct.id
              );
            }
          }

          if (description !== undefined) updateData.description = description;
          if (categoryId !== undefined) {
            updateData.category = { connect: { id: categoryId } };
          }
          if (subcategoryId !== undefined) {
            updateData.subcategory = { connect: { id: subcategoryId } };
          }

          // Update product basic info
          const product = await tx.products.update({
            where: { id },
            data: updateData,
          });

          // Update images if provided
          if (images) {
            await updateProductImages(tx, id, images, existingProduct.images);
          }

          // Update variants if provided
          if (variants) {
            await updateProductVariants(
              tx,
              id,
              variants,
              existingProduct.variants
            );
          }

          return product;
        });

        return {
          success: true,
          productId: result.id,
          message: "Product updated successfully",
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error updating product:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update product",
        });
      }
    }),

  // Soft delete/restore product
  toggleDelete: adminOrManageProductProcedure
    .input(
      z.object({
        id: z.string().uuid("Invalid product id"),
        force: z.boolean().default(false), // Option to force delete even with dependencies
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const product = await ctx.db.products.findUnique({
          where: { id: input.id },
          include: {
            variants: {
              include: {
                cartItems: true,
                orderItems: true,
                wishlists: true,
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

        // Check for dependencies when trying to delete
        if (!product.is_deleted && !input.force) {
          const hasDependencies = product.variants.some(
            (variant) =>
              variant.cartItems.length > 0 ||
              variant.orderItems.length > 0 ||
              variant.wishlists.length > 0
          );

          if (hasDependencies) {
            throw new TRPCError({
              code: "PRECONDITION_FAILED",
              message:
                "Cannot delete product: it has active cart items, orders, or wishlist entries. Use force=true to override.",
            });
          }
        }

        const result = await ctx.db.$transaction(async (tx) => {
          const newDeletedState = !product.is_deleted;

          // Update product
          const updatedProduct = await tx.products.update({
            where: { id: input.id },
            data: {
              is_deleted: newDeletedState,
              deleted_at: newDeletedState ? new Date() : null,
              updated_at: new Date(),
            },
          });

          // Also update variants' deleted state to match parent
          await tx.product_Variants.updateMany({
            where: { product_id: input.id },
            data: {
              is_deleted: newDeletedState,
              deleted_at: newDeletedState ? new Date() : null,
              updated_at: new Date(),
            },
          });

          return updatedProduct;
        });

        return {
          success: true,
          isDeleted: result.is_deleted,
          message: result.is_deleted
            ? "Product moved to trash"
            : "Product restored from trash",
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error toggling product deletion:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to toggle product deletion status",
        });
      }
    }),

  // Permanently delete product
  permanentDelete: adminOrManageProductProcedure
    .input(
      z.object({
        id: z.string().uuid("Invalid product id"),
        confirmDeletion: z.boolean().refine((val) => val === true, {
          message: "Must confirm permanent deletion",
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const product = await ctx.db.products.findUnique({
          where: { id: input.id },
          include: {
            variants: {
              include: {
                cartItems: true,
                orderItems: true,
                wishlists: true,
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

        // Check for critical dependencies that prevent permanent deletion
        const hasCriticalDependencies = product.variants.some(
          (variant) => variant.orderItems.length > 0 // Orders should never lose product data
        );

        if (hasCriticalDependencies) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message:
              "Cannot permanently delete product: it has order history. Use soft delete instead.",
          });
        }

        // Permanent deletion with cascading cleanup
        await ctx.db.$transaction(async (tx) => {
          // Clean up cart items and wishlist entries first
          for (const variant of product.variants) {
            if (variant.cartItems.length > 0) {
              await tx.cart_Items.deleteMany({
                where: { product_variant_id: variant.id },
              });
            }
            if (variant.wishlists.length > 0) {
              await tx.wishlists.deleteMany({
                where: { product_variant_id: variant.id },
              });
            }
          }

          // Delete product (cascading will handle related data)
          await tx.products.delete({
            where: { id: input.id },
          });
        });

        return {
          success: true,
          message: "Product permanently deleted",
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error permanently deleting product:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to permanently delete product",
        });
      }
    }),

  // Bulk operations
  bulkToggleDelete: adminOrManageProductProcedure
    .input(
      z.object({
        ids: z
          .array(z.string().uuid())
          .min(1, "At least one product ID required"),
        action: z.enum(["delete", "restore"]),
        force: z.boolean().default(false),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const results = await ctx.db.$transaction(async (tx) => {
          const results = [];

          for (const id of input.ids) {
            try {
              const product = await tx.products.findUnique({
                where: { id },
                include: {
                  variants: {
                    include: {
                      cartItems: true,
                      orderItems: true,
                      wishlists: true,
                    },
                  },
                },
              });

              if (!product) {
                results.push({
                  id,
                  success: false,
                  error: "Product not found",
                });
                continue;
              }

              const shouldDelete = input.action === "delete";

              // Skip if already in desired state
              if (product.is_deleted === shouldDelete) {
                results.push({
                  id,
                  success: true,
                  message: "No change needed",
                });
                continue;
              }

              // Check dependencies for deletion
              if (shouldDelete && !input.force) {
                const hasDependencies = product.variants.some(
                  (variant) =>
                    variant.cartItems.length > 0 ||
                    variant.orderItems.length > 0 ||
                    variant.wishlists.length > 0
                );

                if (hasDependencies) {
                  results.push({
                    id,
                    success: false,
                    error: "Has active dependencies",
                  });
                  continue;
                }
              }

              // Update product and variants
              await tx.products.update({
                where: { id },
                data: {
                  is_deleted: shouldDelete,
                  deleted_at: shouldDelete ? new Date() : null,
                  updated_at: new Date(),
                },
              });

              await tx.product_Variants.updateMany({
                where: { product_id: id },
                data: {
                  is_deleted: shouldDelete,
                  deleted_at: shouldDelete ? new Date() : null,
                  updated_at: new Date(),
                },
              });

              results.push({
                id,
                success: true,
                message: shouldDelete ? "Deleted" : "Restored",
              });
            } catch (error) {
              results.push({
                id,
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
              });
            }
          }

          return results;
        });

        const successful = results.filter((r) => r.success).length;
        const failed = results.length - successful;

        return {
          success: true,
          message: `Processed ${results.length} products: ${successful} successful, ${failed} failed`,
          results,
        };
      } catch (error) {
        console.error("Error bulk toggling products:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to process bulk operation",
        });
      }
    }),

  bulkPermanentDelete: adminOrManageProductProcedure
    .input(
      z.object({
        ids: z
          .array(z.string().uuid())
          .min(1, "At least one product ID required"),
        confirmDeletion: z.boolean().refine((val) => val === true, {
          message: "Must confirm permanent deletion",
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const results = await ctx.db.$transaction(async (tx) => {
          const results = [];

          for (const id of input.ids) {
            try {
              const product = await tx.products.findUnique({
                where: { id },
                include: {
                  variants: {
                    include: {
                      cartItems: true,
                      orderItems: true,
                      wishlists: true,
                    },
                  },
                },
              });

              if (!product) {
                results.push({
                  id,
                  success: false,
                  error: "Product not found",
                });
                continue;
              }

              // Check for critical dependencies
              const hasCriticalDependencies = product.variants.some(
                (variant) => variant.orderItems.length > 0
              );

              if (hasCriticalDependencies) {
                results.push({
                  id,
                  success: false,
                  error: "Has order history - cannot permanently delete",
                });
                continue;
              }

              // Clean up non-critical dependencies
              for (const variant of product.variants) {
                if (variant.cartItems.length > 0) {
                  await tx.cart_Items.deleteMany({
                    where: { product_variant_id: variant.id },
                  });
                }
                if (variant.wishlists.length > 0) {
                  await tx.wishlists.deleteMany({
                    where: { product_variant_id: variant.id },
                  });
                }
              }

              // Delete product
              await tx.products.delete({ where: { id } });

              results.push({
                id,
                success: true,
                message: "Permanently deleted",
              });
            } catch (error) {
              results.push({
                id,
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
              });
            }
          }

          return results;
        });

        const successful = results.filter((r) => r.success).length;
        const failed = results.length - successful;

        return {
          success: true,
          message: `Processed ${results.length} products: ${successful} permanently deleted, ${failed} failed`,
          results,
        };
      } catch (error) {
        console.error("Error bulk deleting products:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to permanently delete products",
        });
      }
    }),
});
