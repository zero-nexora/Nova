import { adminOrManageCategoryProcedure, createTRPCRouter } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import {
  CreateCategorySchema,
  UpdateCategorySchema,
  GetCategoryByIdSchema,
  DeleteCategorySchema,
  GetCategoryBySlugSchema,
} from "./types";
import { generateSlug } from "./utils";

export const categoriesRouter = createTRPCRouter({
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
    };

    const categories = await ctx.db.categories.findMany({
      select: baseSelect,
    });

    return categories ?? [];
  }),

  getById: adminOrManageCategoryProcedure
    .input(GetCategoryByIdSchema)
    .query(async ({ ctx, input }) => {
      const category = await ctx.db.categories.findFirst({
        where: { id: input.id },
        include: {
          subcategories: {
            select: {
              id: true,
              name: true,
              slug: true,
              image_url: true,
              is_deleted: true,
              _count: {
                select: {
                  products: true,
                },
              },
            },
          },
          _count: {
            select: {
              products: true,
              subcategories: true,
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

      return category;
    }),

  getBySlug: adminOrManageCategoryProcedure
    .input(GetCategoryBySlugSchema)
    .query(async ({ ctx, input }) => {
      const category = await ctx.db.categories.findFirst({
        where: { slug: input.slug },
        include: {
          subcategories: {
            select: {
              id: true,
              name: true,
              slug: true,
              image_url: true,
              is_deleted: true,
              _count: {
                select: {
                  products: true,
                },
              },
            },
          },
          _count: {
            select: {
              products: true,
              subcategories: true,
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

      return category;
    }),

  create: adminOrManageCategoryProcedure
    .input(CreateCategorySchema)
    .mutation(async ({ ctx, input }) => {
      const { name, image_url, public_id } = input;

      const slug = await generateSlug(ctx.db, name, "categories");

      const category = await ctx.db.categories.create({
        data: {
          name,
          public_id,
          image_url,
          slug,
        },
      });

      return category;
    }),

  update: adminOrManageCategoryProcedure
    .input(UpdateCategorySchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      const existingCategory = await ctx.db.categories.findFirst({
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
        slug = await generateSlug(ctx.db, updateData.name, "categories");
      }

      const category = await ctx.db.categories.update({
        where: { id },
        data: {
          ...updateData,
          slug,
        },
      });

      return category;
    }),

  // Toggle soft delete with cascade logic for subcategories
  toggleDeleted: adminOrManageCategoryProcedure
    .input(GetCategoryByIdSchema)
    .mutation(async ({ ctx, input }) => {
      const category = await ctx.db.categories.findFirst({
        where: { id: input.id },
        include: {
          subcategories: {
            select: {
              id: true,
              name: true,
              is_deleted: true,
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

      // Use transaction to update category and subcategories
      const result = await ctx.db.$transaction(async (tx) => {
        // Update main category
        const updatedCategory = await tx.categories.update({
          where: { id: input.id },
          data: {
            is_deleted: newDeletedStatus,
            deleted_at: newDeletedStatus ? new Date() : null,
          },
        });

        // If deleting category (true), update all subcategories
        if (newDeletedStatus && category.subcategories.length > 0) {
          await tx.subcategories.updateMany({
            where: { category_id: input.id },
            data: {
              is_deleted: true,
              deleted_at: new Date(),
            },
          });
        }

        return updatedCategory;
      });

      return result;
    }),

  delete: adminOrManageCategoryProcedure
    .input(DeleteCategorySchema)
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      const category = await ctx.db.categories.findFirst({
        where: { id },
        include: {
          subcategories: {
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

      const deletedCategory = await ctx.db.categories.delete({
        where: { id },
      });

      return deletedCategory;
    }),
});
