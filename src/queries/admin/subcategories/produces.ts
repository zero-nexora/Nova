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

      await ctx.db.subcategories.create({
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

      return { success: true };
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

      await ctx.db.subcategories.update({
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

      return { success: true };
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

      await ctx.db.subcategories.update({
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
          category: { select: { is_deleted: true } },
        },
      });

      if (!subcategories.length) {
        return { success: true, updated: 0, notFound: ids.length };
      }

      const validSubcategories = subcategories.filter(
        (sc) => !sc.category.is_deleted
      );

      let updated: Array<{ id: string; name: string; action: string }> = [];
      if (validSubcategories.length > 0) {
        updated = await ctx.db.$transaction(async (tx) => {
          const results = [];
          for (const subcategory of validSubcategories) {
            const newDeletedStatus = !subcategory.is_deleted;

            const updatedSubcategory = await tx.subcategories.update({
              where: { id: subcategory.id },
              data: {
                is_deleted: newDeletedStatus,
                deleted_at: newDeletedStatus ? new Date() : null,
              },
              select: { id: true, name: true },
            });

            results.push({
              id: updatedSubcategory.id,
              name: updatedSubcategory.name,
              action: newDeletedStatus ? "deleted" : "restored",
            });
          }
          return results;
        });
      }

      const foundIds = subcategories.map((sc) => sc.id);
      const notFound = ids.filter((id) => !foundIds.includes(id)).length;

      return {
        success: true,
        updated: updated.length,
        notFound,
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

      await ctx.db.subcategories.delete({
        where: { id },
        select: {
          id: true,
          name: true,
        },
      });

      return {
        success: true,
      };
    }),

  deleteMultiple: adminOrManageCategoryProcedure
    .input(DeleteMultipleSubcategoriesSchema)
    .mutation(async ({ ctx, input }) => {
      const { ids } = input;

      const subcategories = await ctx.db.subcategories.findMany({
        where: { id: { in: ids } },
        select: { id: true, name: true, products: { select: { id: true } } },
      });

      if (!subcategories.length) {
        return { success: true, deleted: 0, notFound: ids.length };
      }

      const subcategoriesToDelete = subcategories.filter(
        (sc) => sc.products.length === 0
      );

      let deleted: Array<{ id: string; name: string }> = [];
      if (subcategoriesToDelete.length > 0) {
        await ctx.db.subcategories.deleteMany({
          where: { id: { in: subcategoriesToDelete.map((sc) => sc.id) } },
        });
        deleted = subcategoriesToDelete.map((sc) => ({
          id: sc.id,
          name: sc.name,
        }));
      }

      const foundIds = subcategories.map((sc) => sc.id);
      const notFound = ids.filter((id) => !foundIds.includes(id)).length;

      return {
        success: true,
        deleted: deleted.length,
        notFound: notFound,
      };
    }),
});
