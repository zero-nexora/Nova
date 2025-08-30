import { categoriesAdminRouter } from "@/queries/admin/categories/produces";
import { createTRPCRouter } from "../init";

export const appRouter = createTRPCRouter({
  categoriesAdmin: categoriesAdminRouter
});

export type AppRouter = typeof appRouter;
