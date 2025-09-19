import { TRPCError } from "@trpc/server";
import { generateCategorySlug } from "../categories/utils";
import { adminOrManageCategoryProcedure, createTRPCRouter } from "@/trpc/init";
import {
  CreateSubcategorySchema,
  DeleteMultipleSubcategoriesSchema,
  DeleteSubcategorySchema,
  ToggleDeletedMultipleSubcategoriesSchema,
  UpdateSubcategorySchema,
} from "./types";

export const subcategoriesRouter = createTRPCRouter({
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

      const slug = await generateCategorySlug(ctx.db, name, "subcategories");

      const subcategory = await ctx.db.subcategories.create({
        data: {
          name,
          category_id,
          public_id,
          image_url,
          slug,
        },
        select: {
          id: true,
          name: true,
        },
      });

      return subcategory;
    }),

  update: adminOrManageCategoryProcedure
    .input(UpdateSubcategorySchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      const existingSubcategory = await ctx.db.subcategories.findUnique({
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

      let slug = existingSubcategory.slug;

      if (updateData.name && updateData.name !== existingSubcategory.name) {
        slug = await generateCategorySlug(
          ctx.db,
          updateData.name,
          "subcategories",
          existingSubcategory.id
        );
      }

      const subcategory = await ctx.db.subcategories.update({
        where: { id },
        data: {
          ...updateData,
          slug,
        },
        select: {
          id: true,
          name: true,
        },
      });

      return subcategory;
    }),

  toggleDeleted: adminOrManageCategoryProcedure
    .input(DeleteSubcategorySchema)
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      const subcategory = await ctx.db.subcategories.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          is_deleted: true,
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

      if (subcategory.category.is_deleted) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
          "Cannot restore subcategory because parent category is deleted",
        });
      }

      const newDeletedStatus = !subcategory.is_deleted;

      const result = await ctx.db.subcategories.update({
        where: { id },
        data: {
          is_deleted: newDeletedStatus,
          deleted_at: newDeletedStatus ? new Date() : null,
        },
        select: {
          id: true,
          name: true,
          is_deleted: true,
        },
      });

      return {
        success: true,
        data: result,
        action: newDeletedStatus ? "deleted" : "restored",
      };
    }),

  toggleDeletedMultiple: adminOrManageCategoryProcedure
    .input(ToggleDeletedMultipleSubcategoriesSchema)
    .mutation(async ({ ctx, input }) => {
      const { ids } = input;

      const subcategories = await ctx.db.subcategories.findMany({
        where: { id: { in: ids } },
        select: {
          id: true,
          name: true,
          is_deleted: true,
          category: {
            select: {
              id: true,
              name: true,
              is_deleted: true,
            },
          },
        },
      });

      if (subcategories.length === 0) {
        return {
          success: true,
          count: 0,
          data: [],
          notFoundIds: ids,
          violatingSubcategories: [],
        };
      }

      const validSubcategories = subcategories.filter((sc) => {
        return !sc.category.is_deleted;
      });

      const violatingSubcategories = subcategories.filter(
        (sc) => sc.is_deleted && sc.category.is_deleted
      );

      let result: Array<{ id: string; name: string; action: string }> = [];

      if (validSubcategories.length > 0) {
        result = await ctx.db.$transaction(async (tx) => {
          const results = [];

          for (const subcategory of validSubcategories) {
            const newDeletedStatus = !subcategory.is_deleted;

            const updatedSubcategory = await tx.subcategories.update({
              where: { id: subcategory.id },
              data: {
                is_deleted: newDeletedStatus,
                deleted_at: newDeletedStatus ? new Date() : null,
              },
              select: {
                id: true,
                name: true,
              },
            });

            results.push({
              ...updatedSubcategory,
              action: newDeletedStatus ? "deleted" : "restored",
            });
          }

          return results;
        });
      }

      const foundIds = subcategories.map((sc) => sc.id);
      const notFoundIds = ids.filter((id) => !foundIds.includes(id));

      return {
        success: true,
        count: result.length,
        data: result,
        notFoundIds,
        violatingSubcategories: violatingSubcategories.map((sc) => ({
          id: sc.id,
          name: sc.name,
          categoryName: sc.category.name,
          reason: "Parent category is deleted",
        })),
      };
    }),

  delete: adminOrManageCategoryProcedure
    .input(DeleteSubcategorySchema)
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      const subcategory = await ctx.db.subcategories.findFirst({
        where: { id },
        select: {
          id: true,
          name: true,
          products: {
            select: { id: true, name: true },
          },
        },
      });

      if (!subcategory) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Subcategory not found",
        });
      }

      if (subcategory.products.length > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Cannot delete subcategory "${subcategory.name}" because it has ${subcategory.products.length} products. Please delete products first.`,
        });
      }

      const deletedSubcategory = await ctx.db.subcategories.delete({
        where: { id },
        select: {
          id: true,
          name: true,
        },
      });

      return {
        success: true,
        data: deletedSubcategory,
      };
    }),

  deleteMultiple: adminOrManageCategoryProcedure
    .input(DeleteMultipleSubcategoriesSchema)
    .mutation(async ({ ctx, input }) => {
      const { ids } = input;

      const subcategories = await ctx.db.subcategories.findMany({
        where: { id: { in: ids } },
        select: {
          id: true,
          name: true,
          products: {
            select: { id: true, name: true },
          },
        },
      });

      if (subcategories.length === 0) {
        return {
          success: true,
          count: 0,
          deletedSubcategories: [],
          notFoundIds: ids,
          subcategoriesWithProducts: [],
        };
      }

      const subcategoriesWithProducts = subcategories.filter(
        (sc) => sc.products.length > 0
      );

      const subcategoriesToDelete = subcategories.filter(
        (sc) => sc.products.length === 0
      );

      let deletedCount = 0;
      let deletedSubcategories: Array<{ id: string; name: string }> = [];

      if (subcategoriesToDelete.length > 0) {
        await ctx.db.subcategories.deleteMany({
          where: {
            id: { in: subcategoriesToDelete.map((sc) => sc.id) },
          },
        });

        deletedCount = subcategoriesToDelete.length;
        deletedSubcategories = subcategoriesToDelete.map((sc) => ({
          id: sc.id,
          name: sc.name,
        }));
      }

      const foundIds = subcategories.map((sc) => sc.id);
      const notFoundIds = ids.filter((id) => !foundIds.includes(id));

      return {
        success: true,
        count: deletedCount,
        deletedSubcategories,
        notFoundIds,
        subcategoriesWithProducts: subcategoriesWithProducts.map((sc) => ({
          id: sc.id,
          name: sc.name,
          productsCount: sc.products.length,
        })),
      };
    }),
});
