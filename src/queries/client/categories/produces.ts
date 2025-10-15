import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { Category } from "./types";

export const categoriesRouter = createTRPCRouter({
  getAll: baseProcedure.query(async ({ ctx }): Promise<Category[]> => {
    const categories = await ctx.db.categories.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        image_url: true,
        created_at: true,
        updated_at: true,
        subcategories: {
          select: {
            id: true,
            name: true,
            slug: true,
            image_url: true,
            created_at: true,
            updated_at: true,
            category_id: true,
          },
        },
      },
    });

    return categories ?? [];
  }),
});
