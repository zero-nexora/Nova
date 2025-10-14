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
              category_id: true,
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

      const category = await ctx.db.categories.create({
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

      return category;
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

      const category = await ctx.db.categories.update({
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

      return category;
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

      const result = await ctx.db.$transaction(async (tx) => {
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
        data: result,
        action: newDeletedStatus ? "deleted" : "restored",
        affectedSubcategories: category.subcategories.length,
        affectedProducts: category.products.length,
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
          subcategories: {
            select: {
              id: true,
              name: true,
              is_deleted: true,
              category_id: true,
            },
          },
          products: {
            select: {
              id: true,
              name: true,
              is_deleted: true,
              subcategory_id: true,
              category_id: true,
            },
          },
        },
      });

      if (categories.length === 0) {
        return {
          success: true,
          count: 0,
          data: [],
          notFoundIds: ids,
          affectedSubcategories: 0,
          affectedProducts: 0,
        };
      }

      const result = await ctx.db.$transaction(async (tx) => {
        const updatedCategories = [];
        const subcategoriesToUpdate = [];
        const productsToUpdate = [];

        for (const category of categories) {
          const newDeletedStatus = !category.is_deleted;

          const updatedCategory = await tx.categories.update({
            where: { id: category.id },
            data: {
              is_deleted: newDeletedStatus,
              deleted_at: newDeletedStatus ? new Date() : null,
            },
            select: {
              id: true,
              name: true,
            },
          });

          updatedCategories.push({
            ...updatedCategory,
            action: newDeletedStatus ? "deleted" : "restored",
          });

          if (newDeletedStatus && category.subcategories.length > 0) {
            const subcategoryIds = category.subcategories.map(
              (subcategory) => subcategory.id
            );
            subcategoriesToUpdate.push(...subcategoryIds);
          }

          if (newDeletedStatus && category.products.length > 0) {
            const productIds = category.products.map((product) => product.id);
            productsToUpdate.push(...productIds);
          }
        }

        if (subcategoriesToUpdate.length > 0) {
          await tx.subcategories.updateMany({
            where: { id: { in: subcategoriesToUpdate } },
            data: {
              is_deleted: true,
              deleted_at: new Date(),
            },
          });
        }

        if (productsToUpdate.length > 0) {
          await tx.products.updateMany({
            where: { id: { in: productsToUpdate } },
            data: {
              is_deleted: true,
              deleted_at: new Date(),
            },
          });
        }

        return {
          categories: updatedCategories,
          affectedSubcategories: subcategoriesToUpdate.length,
          affectedProducts: productsToUpdate.length,
        };
      });

      const foundIds = categories.map((cat) => cat.id);
      const notFoundIds = ids.filter((id) => !foundIds.includes(id));

      return {
        success: true,
        count: result.categories.length,
        data: result.categories,
        notFoundIds,
        affectedSubcategories: result.affectedSubcategories,
        affectedProducts: result.affectedProducts,
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

      const deletedCategory = await ctx.db.categories.delete({
        where: { id },
        select: {
          id: true,
          name: true,
        },
      });

      return {
        success: true,
        data: deletedCategory,
      };
    }),

  deleteMultiple: adminOrManageCategoryProcedure
    .input(DeleteMultipleCategoriesSchema)
    .mutation(async ({ ctx, input }) => {
      const { ids } = input;

      const categories = await ctx.db.categories.findMany({
        where: {
          id: { in: ids },
        },
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

      if (categories.length === 0) {
        return {
          success: true,
          count: 0,
          deletedCategories: [],
          notFoundIds: ids,
          categoriesWithSubcategories: [],
          categoriesWithProducts: [],
        };
      }

      const categoriesWithSubcategories = categories.filter(
        (cat) => cat.subcategories.length > 0
      );

      const categoriesWithProducts = categories.filter(
        (cat) => cat.products.length > 0
      );

      const categoriesToDelete = categories.filter(
        (cat) => cat.subcategories.length === 0 && cat.products.length === 0
      );

      let deletedCount = 0;
      let deletedCategories: Array<{ id: string; name: string }> = [];

      if (categoriesToDelete.length > 0) {
        await ctx.db.categories.deleteMany({
          where: {
            id: { in: categoriesToDelete.map((cat) => cat.id) },
          },
        });

        deletedCount = categoriesToDelete.length;
        deletedCategories = categoriesToDelete.map((cat) => ({
          id: cat.id,
          name: cat.name,
        }));
      }

      const foundIds = categories.map((cat) => cat.id);
      const notFoundIds = ids.filter((id) => !foundIds.includes(id));

      return {
        success: true,
        count: deletedCount,
        deletedCategories,
        notFoundIds,
        categoriesWithSubcategories: categoriesWithSubcategories.map((cat) => ({
          id: cat.id,
          name: cat.name,
          subcategoriesCount: cat.subcategories.length,
        })),
        categoriesWithProducts: categoriesWithProducts.map((cat) => ({
          id: cat.id,
          name: cat.name,
          productsCount: cat.products.length,
        })),
      };
    }),
});
