import { categoriesRouter } from "@/queries/admin/categories/produces";
import { createTRPCRouter } from "../init";
import { uploadRouter } from "@/queries/admin/uploads/produces";
import { subcategoriesRouter } from "@/queries/admin/subcategories/produces";

export const appRouter = createTRPCRouter({
  admin: {
    categoriesRouter,
    subcategoriesRouter,
  },
  upload: uploadRouter,
});

export type AppRouter = typeof appRouter;
