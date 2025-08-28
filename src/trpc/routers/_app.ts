import { createTRPCRouter } from "../init";
import { authRouter } from "@/modules/auth/server/produres";

export const appRouter = createTRPCRouter({
  auth: authRouter,
});

export type AppRouter = typeof appRouter;
