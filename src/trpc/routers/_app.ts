import { categoriesRouter } from "@/queries/admin/categories/produces";
import { createTRPCRouter } from "../init";
import { uploadRouter } from "@/queries/admin/uploads/produces";

export const appRouter = createTRPCRouter({
  admin: {
    categoriesRouter,
  },
  upload: uploadRouter,
});

export type AppRouter = typeof appRouter;
