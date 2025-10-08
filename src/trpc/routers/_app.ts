import { createTRPCRouter } from "../init";
import { uploadRouter } from "@/queries/admin/uploads/produces";
import { productsRouter } from "@/queries/admin/products/produces";
import { wishlistsRouter } from "@/queries/client/wishlists/produces";
import { categoriesRouter } from "@/queries/admin/categories/produces";
import { subcategoriesRouter } from "@/queries/admin/subcategories/produces";
import { productsRouter as productsRouterClient } from "@/queries/client/products/produces";
import { categoriesRouter as categoriesRouterClient } from "@/queries/client/categories/produces";
import { usersRouter } from "@/queries/client/users/produces";
import { cartsRouter } from "@/queries/client/carts/produces";

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
    wishlistsRouter,
    usersRouter,
    cartsRouter,
  },
});

export type AppRouter = typeof appRouter;
