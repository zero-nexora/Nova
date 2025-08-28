import "server-only";
import { cache } from "react";
import { appRouter } from "./routers/_app";
import { createTRPCContext } from "./init";
import { makeQueryClient } from "./query-client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";

export const getQueryClient = cache(makeQueryClient);
export const trpc = createTRPCOptionsProxy({
  ctx: createTRPCContext,
  router: appRouter,
  queryClient: getQueryClient,
});
export const caller = appRouter.createCaller(createTRPCContext);
