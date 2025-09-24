import { categoriesRouter } from "@/queries/admin/categories/produces";
import { categoriesRouter as categoriesRouterClient } from "@/queries/client/categories/produces";
import { productsRouter as productsRouterClient } from "@/queries/client/products/produces";
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
  client: {
    categoriesRouterClient,
    productsRouterClient,
  },
});

export type AppRouter = typeof appRouter;
