import { generateCategorySlug } from "./utils";
import { TRPCError } from "@trpc/server";
import { adminOrManageCategoryProcedure, createTRPCRouter } from "@/trpc/init";
import {
  CreateCategorySchema,
  UpdateCategorySchema,
  DeleteCategorySchema,
  DeleteMultipleCategoriesSchema,
  ToggleDeletedMultipleCategoriesSchema,
  Category,
} from "./types";

export const categoriesRouter = createTRPCRouter({
  getAll: adminOrManageCategoryProcedure.query(
    async ({ ctx }): Promise<Category[]> => {
      const categories = await ctx.db.categories.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          image_url: true,
          public_id: true,
          is_deleted: true,
          deleted_at: true,
          created_at: true,
          updated_at: true,
          subcategories: {
            select: {
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
                }
              }
            },
          },
        },
      });

      return categories ?? [];
    }
  ),

  create: adminOrManageCategoryProcedure
    .input(CreateCategorySchema)
    .mutation(async ({ ctx, input }) => {
      const { name, image_url, public_id } = input;

      const slug = await generateCategorySlug(ctx.db, name, "categories");

      await ctx.db.categories.create({
        data: {
          name,
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
    .input(UpdateCategorySchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      const existingCategory = await ctx.db.categories.findUnique({
        where: { id },
      });

      if (!existingCategory) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found",
        });
      }

      let slug = existingCategory.slug;

      if (updateData.name && updateData.name !== existingCategory.name) {
        slug = await generateCategorySlug(
          ctx.db,
          updateData.name,
          "categories",
          existingCategory.id
        );
      }

      await ctx.db.categories.update({
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
    .input(DeleteCategorySchema)
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      const category = await ctx.db.categories.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          is_deleted: true,
          subcategories: {
            select: {
              id: true,
              name: true,
              is_deleted: true,
            },
          },
          products: {
            select: {
              id: true,
              name: true,
              is_deleted: true,
              subcategory_id: true,
            },
          },
        },
      });

      if (!category) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found",
        });
      }

      const newDeletedStatus = !category.is_deleted;

      await ctx.db.$transaction(async (tx) => {
        const updatedCategory = await tx.categories.update({
          where: { id },
          data: {
            is_deleted: newDeletedStatus,
            deleted_at: newDeletedStatus ? new Date() : null,
          },
          select: {
            id: true,
            name: true,
          },
        });

        if (newDeletedStatus && category.subcategories.length > 0) {
          await tx.subcategories.updateMany({
            where: { category_id: id },
            data: {
              is_deleted: true,
              deleted_at: new Date(),
            },
          });
        }

        if (newDeletedStatus && category.products.length > 0) {
          await tx.products.updateMany({
            where: { category_id: id },
            data: {
              is_deleted: newDeletedStatus,
              deleted_at: newDeletedStatus ? new Date() : null,
            },
          });
        }

        return updatedCategory;
      });

      return {
        success: true,
        action: newDeletedStatus ? "deleted" : "restored",
      };
    }),

  toggleDeletedMultiple: adminOrManageCategoryProcedure
    .input(ToggleDeletedMultipleCategoriesSchema)
    .mutation(async ({ ctx, input }) => {
      const { ids } = input;

      const categories = await ctx.db.categories.findMany({
        where: { id: { in: ids } },
        select: {
          id: true,
          name: true,
          is_deleted: true,
          subcategories: { select: { id: true } },
          products: { select: { id: true } },
        },
      });

      if (!categories.length) {
        return { success: true, updated: 0, notFound: ids.length };
      }

      const { updatedCategories } = await ctx.db.$transaction(async (tx) => {
        const updatedCategories = [];
        const subcategoriesToUpdate: string[] = [];
        const productsToUpdate: string[] = [];

        for (const category of categories) {
          const newDeletedStatus = !category.is_deleted;

          const updatedCategory = await tx.categories.update({
            where: { id: category.id },
            data: {
              is_deleted: newDeletedStatus,
              deleted_at: newDeletedStatus ? new Date() : null,
            },
            select: { id: true, name: true },
          });

          updatedCategories.push({
            id: updatedCategory.id,
            name: updatedCategory.name,
            action: newDeletedStatus ? "deleted" : "restored",
          });

          if (newDeletedStatus) {
            subcategoriesToUpdate.push(
              ...category.subcategories.map((sub) => sub.id)
            );
            productsToUpdate.push(...category.products.map((prod) => prod.id));
          }
        }

        if (subcategoriesToUpdate.length > 0) {
          await tx.subcategories.updateMany({
            where: { id: { in: subcategoriesToUpdate } },
            data: { is_deleted: true, deleted_at: new Date() },
          });
        }

        if (productsToUpdate.length > 0) {
          await tx.products.updateMany({
            where: { id: { in: productsToUpdate } },
            data: { is_deleted: true, deleted_at: new Date() },
          });
        }

        return { updatedCategories };
      });

      const foundIds = categories.map((cat) => cat.id);
      const notFound = ids.filter((id) => !foundIds.includes(id)).length;

      return {
        success: true,
        updated: updatedCategories.length,
        notFound,
      };
    }),

  delete: adminOrManageCategoryProcedure
    .input(DeleteCategorySchema)
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      const category = await ctx.db.categories.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          subcategories: {
            select: {
              id: true,
              name: true,
            },
          },
          products: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!category) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found",
        });
      }

      if (category.subcategories.length > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Cannot delete category "${category.name}" because it has ${category.subcategories.length} subcategories. Please delete subcategories first.`,
        });
      }

      if (category.products.length > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Cannot delete category "${category.name}" because it has ${category.products.length} products. Please delete products first.`,
        });
      }

      await ctx.db.categories.delete({
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
    .input(DeleteMultipleCategoriesSchema)
    .mutation(async ({ ctx, input }) => {
      const { ids } = input;

      const categories = await ctx.db.categories.findMany({
        where: { id: { in: ids } },
        select: {
          id: true,
          name: true,
          subcategories: { select: { id: true } },
          products: { select: { id: true } },
        },
      });

      if (!categories.length) {
        return { success: true, deleted: 0, notFound: ids.length };
      }

      const categoriesToDelete = categories.filter(
        (cat) => cat.subcategories.length === 0 && cat.products.length === 0
      );

      let deleted: Array<{ id: string; name: string }> = [];
      if (categoriesToDelete.length > 0) {
        await ctx.db.categories.deleteMany({
          where: { id: { in: categoriesToDelete.map((cat) => cat.id) } },
        });
        deleted = categoriesToDelete.map((cat) => ({
          id: cat.id,
          name: cat.name,
        }));
      }

      const foundIds = categories.map((cat) => cat.id);
      const notFound = ids.filter((id) => !foundIds.includes(id)).length;

      return {
        success: true,
        deleted: deleted.length,
        notFound,
      };
    }),
});
