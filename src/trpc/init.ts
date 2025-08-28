import { cache } from "react";
import superjson from "superjson";
import { initTRPC } from "@trpc/server";
import { db } from "@/lib/prisma";
export const createTRPCContext = cache(async () => {});
const t = initTRPC.create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
  transformer: superjson,
});
// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure.use(async ({ next }) => {
  return next({ ctx: { db } });
});
