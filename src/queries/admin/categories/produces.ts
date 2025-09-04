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
    try {
      const categories = await ctx.db.categories.findMany({
        include: {
          parent: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      const transformedData = categories.map((category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        parentName: category.parent?.name || null,
        parentId: category.parent_id,
        image_url: category.image_url,
        public_id: category.public_id,
        created_at: category.created_at,
        updated_at: category.updated_at,
        is_deleted: category.is_deleted,
        deleted_at: category.deleted_at,
      }));

      return { data: transformedData };
    } catch (error) {
      if (error instanceof TRPCError) throw error;

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get all categories",
      });
    }
  }),

  getById: adminOrManageCategoryProcedure
    .input(GetCategoryByIdSchema)
    .query(async ({ ctx, input }) => {
      const category = await ctx.db.categories.findFirst({
        where: { id: input.id },
        include: {
          parent: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          children: {
            where: {
              is_deleted: false,
            },
            select: {
              id: true,
              name: true,
              slug: true,
              image_url: true,
              _count: {
                select: {
                  products: true,
                  children: {
                    where: { is_deleted: false },
                  },
                },
              },
            },
          },
          _count: {
            select: {
              products: true,
              children: {
                where: { is_deleted: false },
              },
            },
          },
        },
      });

      if (!category)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found",
        });

      return category;
    }),

  getBySlug: adminOrManageCategoryProcedure
    .input(GetCategoryBySlugSchema)
    .query(async ({ ctx, input }) => {
      const category = await ctx.db.categories.findFirst({
        where: { slug: input.slug },
        include: {
          parent: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          children: {
            where: { is_deleted: false },
            select: {
              id: true,
              name: true,
              slug: true,
              image_url: true,
              _count: {
                select: {
                  products: true,
                  children: {
                    where: { is_deleted: false },
                  },
                },
              },
            },
          },
          _count: {
            select: {
              products: true,
              children: {
                where: { is_deleted: false },
              },
            },
          },
        },
      });

      if (!category)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found",
        });

      return category;
    }),

  create: adminOrManageCategoryProcedure
    .input(CreateCategorySchema)
    .mutation(async ({ ctx, input }) => {
      const { name, image_url, public_id, parentId } = input;
      try {
        const slug = await generateSlug(ctx.db, name);

        if (parentId) {
          const parentCategory = await ctx.db.categories.findFirst({
            where: { id: parentId, is_deleted: false },
          });

          if (!parentCategory)
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Parent category does not exist",
            });
        }

        const category = await ctx.db.categories.create({
          data: {
            name,
            parent_id: parentId,
            public_id,
            image_url,
            slug,
          },
        });

        return category;
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create category",
        });
      }
    }),

  update: adminOrManageCategoryProcedure
    .input(UpdateCategorySchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;
      try {
        const existingCategory = await ctx.db.categories.findFirst({
          where: { id, is_deleted: false },
        });

        if (!existingCategory)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Category not found",
          });

        let slug = existingCategory.slug;

        if (updateData.name && updateData.name !== existingCategory.name) {
          slug = await generateSlug(ctx.db, updateData.name);
        }

        const category = await ctx.db.categories.update({
          where: { id },
          data: {
            ...updateData,
            slug,
          },
        });

        return category;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update category",
        });
      }
    }),

  delete: adminOrManageCategoryProcedure
    .input(DeleteCategorySchema)
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      try {
        const category = await ctx.db.categories.findFirst({
          where: { id },
        });

        if (!category) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Category not found",
          });
        }
        const deletedCategory = await ctx.db.categories.delete({
          where: { id },
        });

        return deletedCategory;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete category",
        });
      }
    }),

  toggleDeleted: adminOrManageCategoryProcedure
    .input(GetCategoryByIdSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const category = await ctx.db.categories.findFirst({
          where: {
            id: input.id,
          },
        });

        if (!category) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Deleted category not found",
          });
        }

        const toggleDeleted = await ctx.db.categories.update({
          where: { id: input.id },
          data: {
            is_deleted: !category.is_deleted,
            deleted_at: category.is_deleted ? null : new Date(),
          },
        });

        return toggleDeleted;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to restore category",
        });
      }
    }),
});
