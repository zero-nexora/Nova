import { categoriesAdminRouter } from "@/queries/admin/categories/produces";
import { createTRPCRouter } from "../init";
import { uploadRouter } from "@/queries/admin/uploads/produces";

export const appRouter = createTRPCRouter({
  categoriesAdmin: categoriesAdminRouter,
  upload: uploadRouter,
});

export type AppRouter = typeof appRouter;
