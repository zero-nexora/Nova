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
  getProductDetailIncludeOptions,
  getProductIncludeOptions,
  updateProductImages,
  updateProductVariants,
  validateProductDependencies,
  validateVariantData,
} from "./utils";
import { PrismaClient } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { ProductTable } from "@/app/(admin)/admin/products/hooks/types";

export const productsRouter = createTRPCRouter({
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
        const includeOptions = getProductIncludeOptions();

        const [products, totalCount] = await Promise.all([
          ctx.db.products.findMany({
            where,
            skip,
            take: limit,
            orderBy,
            include: includeOptions,
          }),
          ctx.db.products.count({ where }),
        ]);

        const totalPages = Math.ceil(totalCount / limit);

        // UPDATED: Transform data để khớp với interface
        const transformedProducts: ProductTable[] = products.map((product) => ({
          ...product,
          variants: product.variants.map((variant) => ({
            ...variant,
            product_id: product.id,
            variant_attributes: variant.attributes.map((attr) => ({
              id: attr.id,
              product_variant_id: attr.product_variant_id,
              attribute_value_id: attr.attribute_value_id,
              created_at: attr.created_at,
              updated_at: attr.updated_at,
              attribute: attr.attributeValue.attribute,
              attribute_value: attr.attributeValue,
            })),
          })),
          reviews: product.reviews.map((review) => ({
            id: review.id,
            created_at: review.created_at,
            rating: review.rating ?? 0, // Set a default value if rating is null
            comment: review.comment ?? ""
          })),
        }));

        return {
          products: transformedProducts,
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

  // Get product by ID - Enhanced with better error handling
  getById: adminOrManageProductProcedure
    .input(z.object({ id: z.string().uuid("Invalid product id") }))
    .query(async ({ input, ctx }) => {
      try {
        const product = await ctx.db.products.findUnique({
          where: {
            id: input.id,
          },
          include: getProductIncludeOptions(),
        });

        if (!product) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Product not found",
          });
        }

        // Return only non-deleted by default, but allow viewing deleted for admin purposes
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

  // Get product by slug - Enhanced with unique constraint handling
  getBySlug: adminOrManageProductProcedure
    .input(z.object({ slug: z.string().min(1, "Slug is required") }))
    .query(async ({ input, ctx }) => {
      try {
        // Use findUnique since slug has unique constraint
        const product = await ctx.db.products.findUnique({
          where: {
            slug: input.slug,
          },
          include: getProductDetailIncludeOptions(),
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

  // Create product - Enhanced with proper constraint validation
  create: adminOrManageProductProcedure
    .input(CreateProductSchema)
    .mutation(async ({ input, ctx }) => {
      const { categoryId, images, name, variants, description, subcategoryId } =
        input;

      try {
        // Validate dependencies - category_id is required, subcategory_id is optional
        await validateProductDependencies(ctx.db, categoryId, subcategoryId);

        // Validate variant data
        if (variants && variants.length > 0) {
          await validateVariantData(ctx.db, variants);
        }

        // Create product with transaction
        const result = await ctx.db.$transaction(async (tx) => {
          // Generate unique slug with proper uniqueness check
          const slug = await generateProductSlug(tx as PrismaClient, name);

          // Create product - ensure category_id constraint
          const productData: Prisma.ProductsCreateInput = {
            name,
            slug,
            description: description || null, // Handle optional description
            category: { connect: { id: categoryId } }, // Required relation
            // Only connect subcategory if provided (optional relation)
            ...(subcategoryId && {
              subcategory: { connect: { id: subcategoryId } },
            }),
          };

          const product = await tx.products.create({
            data: productData,
          });

          // Create images with proper cascade relationship
          if (images && images.length > 0) {
            await tx.product_Images.createMany({
              data: images.map((img) => ({
                product_id: product.id,
                image_url: img.image_url || "",
                public_id: img.public_id || "",
              })),
            });
          }

          // Create variants with attributes - ensure proper relationships
          if (variants && variants.length > 0) {
            for (const variantData of variants) {
              await createProductVariant(tx, product.id, variantData);
            }
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

        // Handle unique constraint violations
        if (
          error instanceof Error &&
          error.message.includes("Unique constraint")
        ) {
          if (error.message.includes("slug")) {
            throw new TRPCError({
              code: "CONFLICT",
              message: "A product with this slug already exists",
            });
          }
        }

        // Handle foreign key constraint violations
        if (
          error instanceof Error &&
          error.message.includes("Foreign key constraint")
        ) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid category or subcategory reference",
          });
        }

        console.error("Error creating product:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create product",
        });
      }
    }),

  // Update product - Enhanced with constraint handling
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
        // Check if product exists using unique constraint
        const existingProduct = await ctx.db.products.findUnique({
          where: { id },
          include: {
            images: true,
            variants: {
              include: {
                attributes: {
                  include: {
                    attributeValue: {
                      include: {
                        attribute: true,
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

        // Validate dependencies if provided
        if (categoryId || subcategoryId) {
          await validateProductDependencies(
            ctx.db,
            categoryId || existingProduct.category_id,
            subcategoryId
          );
        }

        // Validate variant data if provided
        if (variants && variants.length > 0) {
          await validateVariantData(ctx.db, variants, id);
        }

        // Update product with transaction
        const result = await ctx.db.$transaction(async (tx) => {
          // Prepare update data with proper typing
          const updateData: Prisma.ProductsUpdateInput = {
            updated_at: new Date(),
          };

          // Handle name and slug update
          if (name !== undefined && name !== existingProduct.name) {
            updateData.name = name;
            // Generate new slug if name changed, ensuring uniqueness
            updateData.slug = await generateProductSlug(
              tx as PrismaClient,
              name,
              existingProduct.id
            );
          }

          if (description !== undefined) {
            updateData.description = description;
          }

          // Handle category relationship (required)
          if (
            categoryId !== undefined &&
            categoryId !== existingProduct.category_id
          ) {
            updateData.category = { connect: { id: categoryId } };
          }

          // Handle subcategory relationship (optional, can be null)
          if (subcategoryId !== undefined) {
            if (subcategoryId === null) {
              updateData.subcategory = { disconnect: true };
            } else {
              updateData.subcategory = { connect: { id: subcategoryId } };
            }
          }

          const product = await tx.products.update({
            where: { id },
            data: updateData,
          });

          // Update images with proper cascade handling
          if (images) {
            await updateProductImages(tx, id, images, existingProduct.images);
          }

          // Update variants if provided
          if (variants && variants.length > 0) {
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

        // Handle constraint violations
        if (error instanceof Error) {
          if (
            error.message.includes("Unique constraint") &&
            error.message.includes("slug")
          ) {
            throw new TRPCError({
              code: "CONFLICT",
              message: "A product with this slug already exists",
            });
          }

          if (error.message.includes("Foreign key constraint")) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Invalid category or subcategory reference",
            });
          }
        }

        console.error("Error updating product:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update product",
        });
      }
    }),

  // Soft delete/restore product - Enhanced with proper boolean handling
  toggleDeleted: adminOrManageProductProcedure
    .input(
      z.object({
        id: z.string().uuid("Invalid product id"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id } = input;
      try {
        const product = await ctx.db.products.findUnique({
          where: { id },
          select: {
            id: true,
            is_deleted: true,
          },
        });

        if (!product) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Product not found",
          });
        }

        const newDeletedStatus = !product.is_deleted;
        const updatedProduct = await ctx.db.products.update({
          where: { id },
          data: {
            is_deleted: newDeletedStatus,
            deleted_at: newDeletedStatus ? new Date() : null,
            updated_at: new Date(), // Track when the status changed
          },
        });

        return {
          success: true,
          product: updatedProduct,
          message: newDeletedStatus
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

  // Permanently delete product - Enhanced with proper cascade handling
  delete: adminOrManageProductProcedure
    .input(
      z.object({
        id: z.string().uuid("Invalid product id"),
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
                attributes: true, // Include variant attributes for proper cleanup
              },
            },
            images: true, // Include images for cleanup reference
            reviews: true, // Include reviews that will be cascaded
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

        // Permanent deletion with proper cascade handling
        await ctx.db.$transaction(async (tx) => {
          // The schema has onDelete: Cascade for most relations, but we'll be explicit
          // for non-cascading relations that need manual cleanup

          // Clean up cart items and wishlist entries (not cascaded)
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

          // Delete product - this will cascade to:
          // - Product_Images (onDelete: Cascade)
          // - Product_Variants (onDelete: Cascade)
          //   - Product_Variant_Attributes (onDelete: Cascade)
          // - Reviews (onDelete: Cascade)
          await tx.products.delete({
            where: { id: input.id },
          });
        });

        return {
          success: true,
          message: "Product permanently deleted successfully",
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        // Handle foreign key constraint violations during deletion
        if (
          error instanceof Error &&
          error.message.includes("Foreign key constraint")
        ) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message:
              "Cannot delete product: it has dependencies that prevent deletion",
          });
        }

        console.error("Error permanently deleting product:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to permanently delete product",
        });
      }
    }),

  // Additional utility endpoint - Get product with variants for specific category
  getByCategory: adminOrManageProductProcedure
    .input(
      z.object({
        categoryId: z.string().uuid("Invalid category id"),
        includeDeleted: z.boolean().optional().default(false),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const products = await ctx.db.products.findMany({
          where: {
            category_id: input.categoryId,
            ...(input.includeDeleted ? {} : { is_deleted: false }),
          },
          include: getProductIncludeOptions(),
          orderBy: {
            created_at: "desc",
          },
        });

        return products;
      } catch (error) {
        console.error("Error fetching products by category:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch products by category",
        });
      }
    }),

  // Get product statistics
  getStats: adminOrManageProductProcedure.query(async ({ ctx }) => {
    try {
      const [
        totalProducts,
        activeProducts,
        deletedProducts,
        productsWithVariants,
      ] = await Promise.all([
        ctx.db.products.count(),
        ctx.db.products.count({ where: { is_deleted: false } }),
        ctx.db.products.count({ where: { is_deleted: true } }),
        ctx.db.products.count({
          where: {
            variants: { some: {} },
            is_deleted: false,
          },
        }),
      ]);

      return {
        total: totalProducts,
        active: activeProducts,
        deleted: deletedProducts,
        withVariants: productsWithVariants,
        withoutVariants: activeProducts - productsWithVariants,
      };
    } catch (error) {
      console.error("Error fetching product statistics:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch product statistics",
      });
    }
  }),

  getAllProductAttributes: adminOrManageProductProcedure.query(
    async ({ ctx }) => {
      const productAttributes = await ctx.db.product_Attributes.findMany({
        include: {
          values: true,
        },
      });

      return productAttributes || [];
    }
  ),
});
