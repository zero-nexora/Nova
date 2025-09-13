import { generateCategorySlug } from "./utils";
import { TRPCError } from "@trpc/server";
import { adminOrManageCategoryProcedure, createTRPCRouter } from "@/trpc/init";
import {
  CreateCategorySchema,
  UpdateCategorySchema,
  DeleteCategorySchema,
} from "./types";

export const categoriesRouter = createTRPCRouter({
  getAll: adminOrManageCategoryProcedure.query(async ({ ctx }) => {
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
  }),

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
        slug = await generateCategorySlug(
          ctx.db,
          updateData.name,
          "categories"
        );
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

  toggleDeleted: adminOrManageCategoryProcedure
    .input(DeleteCategorySchema)
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
          where: { id: input.id },
          data: {
            is_deleted: newDeletedStatus,
            deleted_at: newDeletedStatus ? new Date() : null,
          },
        });

        if (newDeletedStatus && category.subcategories.length > 0) {
          await tx.subcategories.updateMany({
            where: { category_id: input.id },
            data: {
              is_deleted: true,
              deleted_at: new Date(),
            },
          });
        }

        if (newDeletedStatus && category.products.length > 0) {
          const productsToDelete = category.products.filter((product) => {
            if (!product.subcategory_id) {
              return true;
            }

            const subcategory = category.subcategories.find(
              (sub) => sub.id === product.subcategory_id
            );
            return subcategory && subcategory.is_deleted;
          });

          if (productsToDelete.length > 0) {
            const productIdsToDelete = productsToDelete.map((p) => p.id);

            await tx.products.updateMany({
              where: {
                id: { in: productIdsToDelete },
              },
              data: {
                is_deleted: true,
                deleted_at: new Date(),
              },
            });
          }
        }

        if (!newDeletedStatus) {
          if (category.subcategories.length > 0) {
            await tx.subcategories.updateMany({
              where: { category_id: input.id },
              data: {
                is_deleted: false,
                deleted_at: null,
              },
            });
          }

          if (category.products.length > 0) {
            await tx.products.updateMany({
              where: { category_id: input.id },
              data: {
                is_deleted: false,
                deleted_at: null,
              },
            });
          }
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
      });

      return deletedCategory;
    }),
});
