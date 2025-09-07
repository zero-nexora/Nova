import { adminOrManageCategoryProcedure, createTRPCRouter } from "@/trpc/init";
import {
  CreateSubcategorySchema,
  DeleteSubcategorySchema,
  GetSubcategoryByIdSchema,
  GetSubcategoryBySlugSchema,
  UpdateSubcategorySchema,
} from "./types";
import { TRPCError } from "@trpc/server";
import { generateSlug } from "../categories/utils";
import z from "zod";

export const subcategoriesRouter = createTRPCRouter({
  getAll: adminOrManageCategoryProcedure.query(async ({ ctx }) => {
    const baseSelect = {
      id: true,
      name: true,
      slug: true,
      image_url: true,
      public_id: true,
      is_deleted: true,
      deleted_at: true,
      created_at: true,
      updated_at: true,
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    };

    const [activeSubcategories, deletedSubcategories] = await Promise.all([
      ctx.db.subcategories.findMany({
        where: { is_deleted: false },
        select: baseSelect,
        orderBy: { created_at: "desc" },
      }),
      ctx.db.subcategories.findMany({
        where: { is_deleted: true },
        select: baseSelect,
        orderBy: { deleted_at: "desc" },
      }),
    ]);

    return { activeSubcategories, deletedSubcategories };
  }),

  getById: adminOrManageCategoryProcedure
    .input(GetSubcategoryByIdSchema)
    .query(async ({ ctx, input }) => {
      const subcategory = await ctx.db.subcategories.findFirst({
        where: { id: input.id },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
              is_deleted: true,
            },
          },
          _count: {
            select: {
              products: true,
            },
          },
        },
      });

      if (!subcategory) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Subcategory not found",
        });
      }

      return subcategory;
    }),

  getBySlug: adminOrManageCategoryProcedure
    .input(GetSubcategoryBySlugSchema)
    .query(async ({ ctx, input }) => {
      const subcategory = await ctx.db.subcategories.findFirst({
        where: { slug: input.slug },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
              is_deleted: true,
            },
          },
          _count: {
            select: {
              products: true,
            },
          },
        },
      });

      if (!subcategory) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Subcategory not found",
        });
      }

      return subcategory;
    }),

  create: adminOrManageCategoryProcedure
    .input(CreateSubcategorySchema)
    .mutation(async ({ ctx, input }) => {
      const { name, image_url, public_id, category_id } = input;

      const categoryExists = await ctx.db.categories.findFirst({
        where: { id: category_id, is_deleted: false },
      });

      if (!categoryExists) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found or is deleted",
        });
      }

      const slug = await generateSlug(ctx.db, name, "subcategories");

      const subcategory = await ctx.db.subcategories.create({
        data: {
          name,
          category_id,
          public_id,
          image_url,
          slug,
        },
      });

      return subcategory;
    }),

  update: adminOrManageCategoryProcedure
    .input(UpdateSubcategorySchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      const existingSubcategory = await ctx.db.subcategories.findFirst({
        where: { id },
      });

      if (!existingSubcategory) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Subcategory not found",
        });
      }

      if (
        updateData.category_id &&
        updateData.category_id !== existingSubcategory.category_id
      ) {
        const categoryExists = await ctx.db.categories.findFirst({
          where: { id: updateData.category_id, is_deleted: false },
        });

        if (!categoryExists) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Category not found or is deleted",
          });
        }
      }

      // Generate new slug if name changed
      let slug = existingSubcategory.slug;
      if (updateData.name && updateData.name !== existingSubcategory.name) {
        slug = await generateSlug(ctx.db, updateData.name, "subcategories");
      }

      const subcategory = await ctx.db.subcategories.update({
        where: { id },
        data: {
          ...updateData,
          slug,
        },
      });

      return subcategory;
    }),

  toggleDeleted: adminOrManageCategoryProcedure
    .input(GetSubcategoryByIdSchema)
    .mutation(async ({ ctx, input }) => {
      const subcategory = await ctx.db.subcategories.findFirst({
        where: { id: input.id },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              is_deleted: true,
            },
          },
        },
      });

      if (!subcategory) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Subcategory not found",
        });
      }

      const newDeletedStatus = !subcategory.is_deleted;

      // If restoring subcategory (false), check that parent category is active
      if (!newDeletedStatus && subcategory.category.is_deleted) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Cannot restore subcategory because parent category is deleted",
        });
      }

      // Use transaction to update subcategory and products
      const result = await ctx.db.$transaction(async (tx) => {
        const updatedSubcategory = await tx.subcategories.update({
          where: { id: input.id },
          data: {
            is_deleted: newDeletedStatus,
            deleted_at: newDeletedStatus ? new Date() : null,
          },
        });

        // If deleting subcategory (true), update all products in this subcategory
        if (newDeletedStatus) {
          await tx.products.updateMany({
            where: { subcategory_id: input.id },
            data: {
              is_deleted: true,
              deleted_at: new Date(),
            },
          });
        }

        return updatedSubcategory;
      });

      return result;
    }),

  togglesDeleted: adminOrManageCategoryProcedure
    .input(z.array(z.string()))
    .mutation(async ({ ctx, input }) => {
      const subcategories = await ctx.db.subcategories.findMany({
        where: { id: { in: input } },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              is_deleted: true,
            },
          },
        },
      });

      if (subcategories.length !== input.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Some subcategories not found",
        });
      }

      for (const subcategory of subcategories) {
        const willBeRestored = subcategory.is_deleted;

        if (willBeRestored && subcategory.category.is_deleted) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Cannot restore subcategory "${subcategory.name}" because parent category is deleted`,
          });
        }
      }

      const results = await ctx.db.$transaction(async (tx) => {
        const updatedSubcategories = [];

        for (const subcategory of subcategories) {
          const newDeletedStatus = !subcategory.is_deleted;

          const updatedSubcategory = await tx.subcategories.update({
            where: { id: subcategory.id },
            data: {
              is_deleted: newDeletedStatus,
              deleted_at: newDeletedStatus ? new Date() : null,
            },
          });

          // If deleting subcategory (true), update all products in this subcategory
          if (newDeletedStatus) {
            await tx.products.updateMany({
              where: { subcategory_id: subcategory.id },
              data: {
                is_deleted: true,
                deleted_at: new Date(),
              },
            });
          }

          updatedSubcategories.push(updatedSubcategory);
        }

        return updatedSubcategories;
      });

      return results;
    }),

  delete: adminOrManageCategoryProcedure
    .input(DeleteSubcategorySchema)
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      const subcategory = await ctx.db.subcategories.findFirst({
        where: { id },
        include: {
          products: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!subcategory) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Subcategory not found",
        });
      }

      // Check if subcategory has products before permanent deletion
      if (subcategory.products.length > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Cannot delete subcategory "${subcategory.name}" because it has ${subcategory.products.length} products. Please delete products first.`,
        });
      }

      const deletedSubcategory = await ctx.db.subcategories.delete({
        where: { id },
      });

      return deletedSubcategory;
    }),

  deletes: adminOrManageCategoryProcedure
    .input(z.array(z.string()))
    .mutation(async ({ ctx, input }) => {
      const subcategories = await ctx.db.subcategories.findMany({
        where: { id: { in: input } },
        include: {
          products: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (subcategories.length !== input.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Some subcategories were not found",
        });
      }

      // Check if any subcategories have products
      const subcategoriesWithProducts = subcategories.filter(
        (subcat) => subcat.products.length > 0
      );
      if (subcategoriesWithProducts.length > 0) {
        const subcategoryNames = subcategoriesWithProducts
          .map((subcat) => subcat.name)
          .join(", ");
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Cannot delete subcategories with products: ${subcategoryNames}. Please delete products first.`,
        });
      }

      const result = await ctx.db.$transaction(async (tx) => {
        return await tx.subcategories.deleteMany({
          where: { id: { in: input } },
        });
      });

      return {
        deletedCount: result.count,
        message: `Successfully permanently deleted ${result.count} subcategories`,
      };
    }),
});