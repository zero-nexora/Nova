import { categoriesRouter } from "@/queries/admin/categories/produces";
import { createTRPCRouter } from "../init";
import { uploadRouter } from "@/queries/admin/uploads/produces";
import { subcategoriesRouter } from "@/queries/admin/subcategories/produces";
import { productsRouter } from "@/queries/admin/products/produces";

export const appRouter = createTRPCRouter({
  admin: {
    categoriesRouter,
    subcategoriesRouter,
    productsRouter,
  },
  upload: uploadRouter,
});

export type AppRouter = typeof appRouter;
