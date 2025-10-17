import { createTRPCRouter } from "../init";
import { rolesRouter } from "@/queries/admin/roles/produrce";
import { cartsRouter } from "@/queries/client/carts/produces";
import { usersRouter } from "@/queries/client/users/produces";
import { uploadRouter } from "@/queries/admin/uploads/produces";
import { productsRouter } from "@/queries/admin/products/produces";
import { wishlistsRouter } from "@/queries/client/wishlists/produces";
import { categoriesRouter } from "@/queries/admin/categories/produces";
import { permissionsRouter } from "@/queries/admin/permissions/produces";
import { subcategoriesRouter } from "@/queries/admin/subcategories/produces";
import { productsRouter as productsRouterClient } from "@/queries/client/products/produces";
import { categoriesRouter as categoriesRouterClient } from "@/queries/client/categories/produces";
import { productAttributesRouter } from "@/queries/admin/product-attributes/produces";

export const appRouter = createTRPCRouter({
  admin: {
    rolesRouter,
    productsRouter,
    categoriesRouter,
    permissionsRouter,
    subcategoriesRouter,
    productAttributesRouter,
  },
  upload: uploadRouter,
  client: {
    cartsRouter,
    usersRouter,
    wishlistsRouter,
    productsRouterClient,
    categoriesRouterClient,
  },
});

export type AppRouter = typeof appRouter;
