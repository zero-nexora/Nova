import z from "zod";
import { Prisma, RoleName } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { UserByRoleResponse } from "./types";
import { DEFAULT_LIMIT, DEFAULT_PAGE } from "@/lib/constants";
import { adminOrManageStaffProcedure, createTRPCRouter } from "@/trpc/init";

export const rolesRouter = createTRPCRouter({
  getUserByRole: adminOrManageStaffProcedure
    .input(
      z.object({
        roleId: z.string().uuid().optional(),
        search: z.string().optional(),
        limit: z.number().int().positive().default(DEFAULT_LIMIT),
        page: z.number().int().nonnegative().default(DEFAULT_PAGE),
      })
    )
    .query(async ({ ctx, input }): Promise<UserByRoleResponse> => {
      const { roleId, search, limit, page } = input;
      const skip = (page - 1) * limit;

      if (roleId) {
        const exists = await ctx.db.roles.findUnique({
          where: { id: roleId },
          select: { id: true },
        });

        if (!exists) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Role not found",
          });
        }
      }

      const where: Prisma.UsersWhereInput = {
        id: { not: ctx.userId },
        roles: {
          none: {
            role: {
              name: RoleName.ADMIN,
            },
          },
        },
        ...(roleId && {
          roles: {
            some: { role_id: roleId },
          },
        }),

        ...(search && {
          OR: [
            { first_name: { contains: search, mode: "insensitive" } },
            { last_name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }),
      };

      const [users, totalItems] = await Promise.all([
        ctx.db.users.findMany({
          where,
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            image_url: true,
            roles: {
              select: {
                role: {
                  select: {
                    id: true,
                    name: true,
                    description: true,
                  },
                },
              },
              ...(roleId && { where: { role_id: roleId } }),
            },
          },
          orderBy: { email: "asc" },
          skip,
          take: limit,
        }),
        ctx.db.users.count({ where }),
      ]);

      return {
        items: users,
        totalItems,
        limit,
        page,
      };
    }),

  updateUserRole: adminOrManageStaffProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
        roleIds: z.array(z.string().uuid()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId, roleIds } = input;

      const user = await ctx.db.users.findUnique({
        where: { id: userId },
      });
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      const roles = await ctx.db.roles.findMany({
        where: { id: { in: roleIds } },
        select: { id: true },
      });

      const foundRoleIds = new Set(roles.map((role) => role.id));
      const invalidRoleIds = roleIds.filter((id) => !foundRoleIds.has(id));

      if (invalidRoleIds.length > 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Roles not found: ${invalidRoleIds.join(", ")}`,
        });
      }

      const updatedUser = await ctx.db.$transaction(async (tx) => {
        const adminRole = await tx.roles.findFirst({
          where: { name: { equals: RoleName.ADMIN } },
          select: { id: true },
        });

        const isAdminRoleIncluded = adminRole && roleIds.includes(adminRole.id);

        if (isAdminRoleIncluded) {
          await tx.user_Roles.deleteMany({
            where: { user_id: userId },
          });

          await tx.user_Roles.create({
            data: {
              user_id: userId,
              role_id: adminRole.id,
            },
          });
        } else {
          const currentRoles = await tx.user_Roles.findMany({
            where: { user_id: userId },
            select: { role_id: true },
          });

          const currentRoleIds = new Set(currentRoles.map((r) => r.role_id));

          const rolesToAdd = roleIds.filter((id) => !currentRoleIds.has(id));

          const rolesToRemove = [...currentRoleIds].filter(
            (id) => !roleIds.includes(id)
          );

          if (rolesToAdd.length > 0) {
            await tx.user_Roles.createMany({
              data: rolesToAdd.map((roleId) => ({
                user_id: userId,
                role_id: roleId,
              })),
              skipDuplicates: true,
            });
          }

          if (rolesToRemove.length > 0) {
            await tx.user_Roles.deleteMany({
              where: {
                user_id: userId,
                role_id: { in: rolesToRemove },
              },
            });
          }
        }

        return tx.users.findUnique({
          where: { id: userId },
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            image_url: true,
            roles: {
              select: {
                id: true,
                role: {
                  select: {
                    id: true,
                    name: true,
                    description: true,
                  },
                },
              },
            },
          },
        });
      });

      if (!updatedUser) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch updated user data",
        });
      }

      return updatedUser;
    }),
});
