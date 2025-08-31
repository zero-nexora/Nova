import {
  CategoryColumn,
  CategoryWithChildren,
  UpdateCategorySchema,
} from "@/lib/types";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { TRPCError } from "@trpc/server";

export const categoriesAdminRouter = createTRPCRouter({
  getMany: baseProcedure.query(async ({ ctx }) => {
    const categories = await ctx.db.categories.findMany({
      where: { parent_id: null },
      include: {
        children: {
          include: {
            children: {
              include: {
                children: true,
              },
            },
          },
        },
      },
    });

    function flatten(
      categories: CategoryWithChildren[],
      parentName: string | null = null
    ): CategoryColumn[] {
      return categories.flatMap((category) => {
        const current: CategoryColumn = {
          id: category.id,
          name: category.name,
          parentName,
          image_url: category.image_url,
          created_at: category.created_at,
          updated_at: category.updated_at,
          is_deleted: category.is_deleted,
        };

        const children = category.children
          ? flatten(category.children, category.name)
          : [];

        return [current, ...children];
      });
    }

    return flatten(categories);
  }),

  updateCategory: baseProcedure
    .input(UpdateCategorySchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const categoryExisting = await ctx.db.categories.findUnique({
        where: { id },
      });

      if (!categoryExisting) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found",
        });
      }

      const updated = await ctx.db.categories.update({
        where: { id },
        data,
      });

      return updated;
    }),
});
