import { cache } from "react";
import superjson from "superjson";
import { initTRPC, TRPCError } from "@trpc/server";
import { db } from "@/database/prisma";
import { auth } from "@clerk/nextjs/server";
import { RoleName } from "@prisma/client";
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

export const protectedProcedure = baseProcedure.use(async ({ ctx, next }) => {
  const { userId } = await auth();

  if (!userId)
    throw new TRPCError({ code: "UNAUTHORIZED", message: "UNAUTHORIZED" });

  return next({
    ctx: {
      ...ctx,
      userId,
    },
  });
});

export const adminProcedure = createRoleProcedure(
  [RoleName.ADMIN],
  "Admins only"
);

export const adminOrManageProductProcedure = createRoleProcedure(
  [RoleName.ADMIN, RoleName.MANAGE_PRODUCT],
  "Admins or Manage product only"
);

export const adminOrManageCategoryProcedure = createRoleProcedure(
  [RoleName.ADMIN, RoleName.MANAGE_CATEGORY],
  "Admins or Manage category only"
);

export const adminOrManageStaffProcedure = createRoleProcedure(
  [RoleName.ADMIN, RoleName.MANAGE_STAFF],
  "Admins or Manage staff only"
);

export const adminOrManageOrderProcedure = createRoleProcedure(
  [RoleName.ADMIN, RoleName.MANAGE_ORDER],
  "Admins or Manage order only"
);

function createRoleProcedure(allowedRoles: RoleName[], message: string) {
  return protectedProcedure.use(async ({ ctx, next }) => {
    const user = await ctx.db.users.findUnique({
      where: { clerkId: ctx.userId },
      select: { roles: { select: { role: { select: { name: true } } } } },
    });

    if (!user)
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

    const hasAccess = user.roles.some((r) =>
      allowedRoles.includes(r.role.name)
    );

    if (!hasAccess) throw new TRPCError({ code: "FORBIDDEN", message });

    return next({ ctx: { ...ctx, roles: user.roles } });
  });
}
