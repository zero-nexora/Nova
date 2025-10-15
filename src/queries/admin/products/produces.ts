import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { adminOrManageProductProcedure, createTRPCRouter } from "@/trpc/init";
import {
  createOrUpdateVariants,
  createVariants,
  deleteProductDependencies,
  fetchProductWithRelations,
  generateProductSlug,
  getUniqueVariants,
  validateCategory,
  validateCategoryAndSubcategory,
  validateSubcategory,
  validateVariants,
} from "./utils";
import { PrismaClient } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import {
  CreateProductSchema,
  deleteMultipleSchema,
  deleteSchema,
  GetAllProductsResponse,
  GetPaginationProductsSchema,
  ProductResponse,
  toggleMultipleSchema,
  toggleSchema,
  UpdateProductSchema,
} from "./types";

export const productsRouter = createTRPCRouter({
  getAll: adminOrManageProductProcedure
    .input(GetPaginationProductsSchema)
    .query(async ({ input, ctx }): Promise<GetAllProductsResponse> => {
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

      // Build where clause
      const where: Prisma.ProductsWhereInput = {};

      // Search filter
      if (search?.trim()) {
        where.OR = [
          { name: { contains: search.trim(), mode: "insensitive" } },
          { description: { contains: search.trim(), mode: "insensitive" } },
          { slug: { contains: search.trim(), mode: "insensitive" } },
        ];
      }

      // Category and subcategory filters
      if (slugCategory) {
        where.category = { slug: slugCategory };
      }
      if (slugSubcategory) {
        where.subcategory = { slug: slugSubcategory };
      }

      // Deleted status filter
      if (isDeleted === "true") {
        where.is_deleted = true;
      } else if (isDeleted === "false") {
        where.is_deleted = false;
      }

      // Price range filter
      if (priceMin !== undefined || priceMax !== undefined) {
        where.variants = {
          some: {
            AND: [
              priceMin !== undefined ? { price: { gte: priceMin } } : {},
              priceMax !== undefined ? { price: { lte: priceMax } } : {},
            ],
          },
        };
      }

      // Calculate pagination
      const skip = (page - 1) * limit;

      // Get total count
      const totalItems = await ctx.db.products.count({ where });

      // Fetch products
      const products = await ctx.db.products.findMany({
        where,
        skip,
        take: limit,
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

      const formattedProducts: ProductResponse[] = products.map((product) => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        is_deleted: product.is_deleted,
        created_at: product.created_at,
        updated_at: product.updated_at,
        category: product.category,
        subcategory: product.subcategory,
        images: product.images || null,
        variants: product.variants.map((variant) => ({
          id: variant.id,
          sku: variant.sku,
          price: variant.price,
          stock_quantity: variant.stock_quantity,
          attributes: variant.attributes.map((attr) => ({
            id: attr.id,
            value: attr.attributeValue.value,
            attribute: attr.attributeValue.attribute,
            attributeValue: attr.attributeValue,
          })),
        })),
        reviewCount: product._count.reviews,
        variantCount: product._count.variants,
      }));

      return {
        items: formattedProducts || [],
        totalItems,
        page,
        limit,
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
    .input(CreateProductSchema)
    .mutation(async ({ input, ctx }) => {
      const { name, description, categoryId, subcategoryId, images, variants } =
        input;

      // Validate inputs
      await validateCategory(ctx.db, categoryId);
      if (subcategoryId) {
        await validateSubcategory(ctx.db, subcategoryId, categoryId);
      }
      await validateVariants(ctx.db, variants, null);

      const uniqueVariants = getUniqueVariants(variants);

      return await ctx.db.$transaction(async (tx) => {
        const slug = await generateProductSlug(tx as PrismaClient, name);

        const product = await tx.products.create({
          data: {
            name,
            slug,
            description: description || null,
            category_id: categoryId,
            subcategory_id: subcategoryId || null,
          },
          select: { id: true, name: true },
        });

        if (images?.length) {
          await tx.product_Images.createMany({
            data: images.map((img) => ({
              product_id: product.id,
              image_url: img.image_url,
              public_id: img.public_id,
            })),
          });
        }

        await createVariants(tx as PrismaClient, product.id, uniqueVariants);

        return { success: true };
      });
    }),
  update: adminOrManageProductProcedure
    .input(UpdateProductSchema)
    .mutation(async ({ input, ctx }) => {
      const {
        id,
        name,
        description,
        categoryId,
        subcategoryId,
        images,
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

      // Validate category and subcategory
      if (categoryId || subcategoryId) {
        await validateCategory(
          ctx.db,
          categoryId || existingProduct.category_id
        );
        if (subcategoryId) {
          await validateSubcategory(
            ctx.db,
            subcategoryId,
            categoryId || existingProduct.category_id
          );
        }
      }

      // Validate variants
      await validateVariants(ctx.db, variants, id);

      // Ensure unique variants
      const uniqueVariants = getUniqueVariants(variants);

      // Update product in a transaction
      return await ctx.db.$transaction(async (tx) => {
        // Prepare update data
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

        // Update product
        await tx.products.update({
          where: { id },
          data: updateData,
          select: { id: true, name: true },
        });

        // Update images
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

        if (uniqueVariants.length) {
          const existingVariantIds = new Set(
            existingProduct.variants.map((v) => v.id)
          );
          const newVariantIds = new Set(
            uniqueVariants.filter((v) => v.id).map((v) => v.id!)
          );

          // Delete variants not in the updated list
          const variantsToDelete = existingProduct.variants.filter(
            (v) => !newVariantIds.has(v.id)
          );
          if (variantsToDelete.length > 0) {
            await tx.product_Variants.deleteMany({
              where: { id: { in: variantsToDelete.map((v) => v.id) } },
            });
          }

          // Create or update variants
          await createOrUpdateVariants(
            tx as PrismaClient,
            id,
            uniqueVariants,
            existingVariantIds
          );
        } else if (existingProduct.variants.length > 0) {
          // Delete all variants if none provided
          await tx.product_Variants.deleteMany({
            where: { id: { in: existingProduct.variants.map((v) => v.id) } },
          });
        }

        return { success: true };
      });
    }),

  toggleDeleted: adminOrManageProductProcedure
    .input(toggleSchema)
    .mutation(async ({ input, ctx }) => {
      const { id } = input;
      const product = await fetchProductWithRelations(ctx.db, id);

      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      validateCategoryAndSubcategory(product);

      const newDeletedStatus = !product.is_deleted;
      await ctx.db.products.update({
        where: { id },
        data: {
          is_deleted: newDeletedStatus,
          deleted_at: newDeletedStatus ? new Date() : null,
          updated_at: new Date(),
        },
        select: { id: true, name: true, is_deleted: true },
      });

      return {
        success: true,
        action: newDeletedStatus ? "deleted" : "restored",
      };
    }),

  toggleDeletedMultiple: adminOrManageProductProcedure
    .input(toggleMultipleSchema)
    .mutation(async ({ input, ctx }) => {
      const { ids } = input;
      if (!ids.length) {
        return {
          success: true,
          updated: [],
          notFound: [],
        };
      }

      const products = await ctx.db.products.findMany({
        where: { id: { in: ids } },
        select: {
          id: true,
          name: true,
          is_deleted: true,
          category: { select: { id: true, is_deleted: true } },
          subcategory: { select: { id: true, is_deleted: true } },
        },
      });

      if (!products.length) {
        return {
          success: true,
          updated: 0,
          notFound: 0,
        };
      }

      const updated: { id: string; name: string; is_deleted: boolean }[] = [];
      const skipped: { id: string; name: string; reason: string }[] = [];
      const notFound = ids.filter((id) => !products.some((p) => p.id === id));

      for (const product of products) {
        if (product.category.is_deleted || product.subcategory?.is_deleted) {
          skipped.push({
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
          select: { id: true, name: true, is_deleted: true },
        });

        updated.push(updatedProduct);
      }

      return {
        success: true,
        updated: updated.length,
        notFound: notFound.length,
      };
    }),

  delete: adminOrManageProductProcedure
    .input(deleteSchema)
    .mutation(async ({ input, ctx }) => {
      const { id } = input;
      const product = await ctx.db.products.findUnique({
        where: { id, is_deleted: false },
        select: { id: true, name: true, variants: { select: { id: true } } },
      });

      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found or already deleted",
        });
      }

      await ctx.db.$transaction(async (tx) => {
        await deleteProductDependencies(
          tx as PrismaClient,
          id,
          product.variants.map((v) => v.id)
        );
        await tx.products.delete({
          where: { id },
          select: { id: true, name: true },
        });
      });

      return { success: true };
    }),

  deleteMultiple: adminOrManageProductProcedure
    .input(deleteMultipleSchema)
    .mutation(async ({ input, ctx }) => {
      const { ids } = input;
      const products = await ctx.db.products.findMany({
        where: { id: { in: ids }, is_deleted: false },
        select: { id: true, name: true, variants: { select: { id: true } } },
      });

      if (!products.length) {
        return { success: true, deleted: [], notFound: ids };
      }

      const deleted = await ctx.db.$transaction(async (tx) => {
        const variantIds = products.flatMap((p) => p.variants.map((v) => v.id));
        await deleteProductDependencies(
          tx as PrismaClient,
          products.map((p) => p.id),
          variantIds
        );
        await tx.products.deleteMany({
          where: { id: { in: products.map((p) => p.id) } },
        });
        return products.map((p) => ({ id: p.id, name: p.id }));
      });

      const notFound = ids.filter((id) => !products.some((p) => p.id === id));

      return {
        success: true,
        deleted: deleted.length,
        notFound: notFound.length,
      };
    }),
});
