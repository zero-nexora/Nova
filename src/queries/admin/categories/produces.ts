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
import z from "zod";

export const categoriesRouter = createTRPCRouter({
  // Lấy categories theo trạng thái is_deleted
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
      parent: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      children: {
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
        },
      },
    };

    const [activeCategories, deletedCategories] = await Promise.all([
      ctx.db.categories.findMany({
        where: { parent_id: null, is_deleted: false },
        select: baseSelect,
        orderBy: { created_at: "desc" },
      }),
      ctx.db.categories.findMany({
        where: { parent_id: null, is_deleted: true },
        select: baseSelect,
        orderBy: { deleted_at: "desc" },
      }),
    ]);

    return { activeCategories, deletedCategories };
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
              is_deleted: true,
            },
          },
          children: {
            select: {
              id: true,
              name: true,
              slug: true,
              image_url: true,
              is_deleted: true,
              _count: {
                select: {
                  products: true,
                  children: true,
                },
              },
            },
          },
          _count: {
            select: {
              products: true,
              children: true,
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
          parent: {
            select: {
              id: true,
              name: true,
              slug: true,
              is_deleted: true,
            },
          },
          children: {
            select: {
              id: true,
              name: true,
              slug: true,
              image_url: true,
              is_deleted: true,
              _count: {
                select: {
                  products: true,
                  children: true,
                },
              },
            },
          },
          _count: {
            select: {
              products: true,
              children: true,
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
      const { name, image_url, public_id, parent_id } = input;

      if (parent_id) {
        const parentExists = await ctx.db.categories.findFirst({
          where: { id: parent_id, is_deleted: false },
        });

        if (!parentExists) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Parent category not found or is deleted",
          });
        }
      }

      const slug = await generateSlug(ctx.db, name);

      const category = await ctx.db.categories.create({
        data: {
          name,
          parent_id: parent_id,
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

      // Validate parent category if being updated
      if (
        updateData.parent_id &&
        updateData.parent_id !== existingCategory.parent_id
      ) {
        const parentExists = await ctx.db.categories.findFirst({
          where: { id: updateData.parent_id, is_deleted: false },
        });

        if (!parentExists) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Parent category not found or is deleted",
          });
        }

        if (updateData.parent_id === id) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Cannot set category as its own parent",
          });
        }
      }

      // Generate new slug if name changed
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
    }),

  // Toggle soft delete với logic cascade cho children
  toggleDeleted: adminOrManageCategoryProcedure
    .input(GetCategoryByIdSchema)
    .mutation(async ({ ctx, input }) => {
      const category = await ctx.db.categories.findFirst({
        where: { id: input.id },
        include: {
          children: {
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

      // Nếu restore category (false), kiểm tra parent phải active
      if (!newDeletedStatus && category.parent_id) {
        const parentCategory = await ctx.db.categories.findFirst({
          where: { id: category.parent_id, is_deleted: false },
        });

        if (!parentCategory) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "Cannot restore category because parent category is deleted",
          });
        }
      }

      // Sử dụng transaction để update category và children
      const result = await ctx.db.$transaction(async (tx) => {
        // Update category chính
        const updatedCategory = await tx.categories.update({
          where: { id: input.id },
          data: {
            is_deleted: newDeletedStatus,
            deleted_at: newDeletedStatus ? new Date() : null,
          },
        });

        // Nếu delete category cha (true), update tất cả children
        if (newDeletedStatus && category.children.length > 0) {
          await tx.categories.updateMany({
            where: { parent_id: input.id },
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

  togglesDeleted: adminOrManageCategoryProcedure
    .input(z.array(z.string()))
    .mutation(async ({ ctx, input }) => {
      const categories = await ctx.db.categories.findMany({
        where: { id: { in: input } },
        include: {
          children: {
            select: {
              id: true,
              is_deleted: true,
            },
          },
        },
      });

      if (categories.length !== input.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Some categories not found",
        });
      }

      // Validate restore operations
      for (const category of categories) {
        const willBeRestored = category.is_deleted;

        if (willBeRestored && category.parent_id) {
          const parentExists = await ctx.db.categories.findFirst({
            where: { id: category.parent_id, is_deleted: false },
          });

          if (!parentExists) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `Cannot restore category "${category.name}" because parent is deleted`,
            });
          }
        }
      }

      const results = await ctx.db.$transaction(async (tx) => {
        const updatedCategories = [];

        for (const category of categories) {
          const newDeletedStatus = !category.is_deleted;

          // Update category chính
          const updatedCategory = await tx.categories.update({
            where: { id: category.id },
            data: {
              is_deleted: newDeletedStatus,
              deleted_at: newDeletedStatus ? new Date() : null,
            },
          });

          if (newDeletedStatus && category.children.length > 0) {
            await tx.categories.updateMany({
              where: { parent_id: category.id },
              data: {
                is_deleted: true,
                deleted_at: new Date(),
              },
            });
          }

          updatedCategories.push(updatedCategory);
        }

        return updatedCategories;
      });

      return results;
    }),

  delete: adminOrManageCategoryProcedure
    .input(DeleteCategorySchema)
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      const category = await ctx.db.categories.findFirst({
        where: { id },
        include: {
          children: {
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

      if (category.children.length > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Cannot delete category "${category.name}" because it has ${category.children.length} children. Please delete children first.`,
        });
      }

      const deletedCategory = await ctx.db.categories.delete({
        where: { id },
      });

      return deletedCategory;
    }),

  permanentlyDelete: adminOrManageCategoryProcedure
    .input(z.array(z.string()))
    .mutation(async ({ ctx, input }) => {
      const categories = await ctx.db.categories.findMany({
        where: { id: { in: input } },
        include: {
          children: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (categories.length !== input.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Some categories were not found",
        });
      }

      const categoriesWithChildren = categories.filter(
        (cat) => cat.children.length > 0
      );
      if (categoriesWithChildren.length > 0) {
        const categoryNames = categoriesWithChildren
          .map((cat) => cat.name)
          .join(", ");
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Cannot delete categories with children: ${categoryNames}. Please delete children first.`,
        });
      }

      const result = await ctx.db.$transaction(async (tx) => {
        return await tx.categories.deleteMany({
          where: { id: { in: input } },
        });
      });

      return {
        deletedCount: result.count,
        message: `Successfully permanently deleted ${result.count} categories`,
      };
    }),

  getStats: adminOrManageCategoryProcedure.query(async ({ ctx }) => {
    const [totalActive, totalDeleted, rootActive, rootDeleted] =
      await Promise.all([
        ctx.db.categories.count({ where: { is_deleted: false } }),
        ctx.db.categories.count({ where: { is_deleted: true } }),
        ctx.db.categories.count({
          where: { parent_id: null, is_deleted: false },
        }),
        ctx.db.categories.count({
          where: { parent_id: null, is_deleted: true },
        }),
      ]);

    return {
      total: totalActive + totalDeleted,
      active: totalActive,
      deleted: totalDeleted,
      rootCategories: {
        active: rootActive,
        deleted: rootDeleted,
      },
    };
  }),

  getTree: adminOrManageCategoryProcedure
    .input(z.object({ includeDeleted: z.boolean().default(false) }))
    .query(async ({ ctx, input }) => {
      const whereCondition = input.includeDeleted ? {} : { is_deleted: false };

      const categories = await ctx.db.categories.findMany({
        where: { parent_id: null, ...whereCondition },
        select: {
          id: true,
          name: true,
          slug: true,
          image_url: true,
          is_deleted: true,
          deleted_at: true,
          children: {
            where: whereCondition,
            select: {
              id: true,
              name: true,
              slug: true,
              image_url: true,
              is_deleted: true,
              deleted_at: true,
              children: {
                where: whereCondition,
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  image_url: true,
                  is_deleted: true,
                  deleted_at: true,
                },
              },
            },
          },
        },
        orderBy: { name: "asc" },
      });

      return { data: categories };
    }),
});
