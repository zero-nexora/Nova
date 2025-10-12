import z from "zod";
import { RolePermissionData } from "./types";
import { adminOrManageStaffProcedure, createTRPCRouter } from "@/trpc/init";

export const rolesAndPermissionsRouter = createTRPCRouter({
  getAllRoleAndPermissions: adminOrManageStaffProcedure.query(
    async ({ ctx }): Promise<RolePermissionData> => {
      const roles = await ctx.db.roles.findMany({
        select: {
          id: true,
          name: true,
          description: true,
          permissions: {
            select: {
              permission: {
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

      const allPermissions = await ctx.db.permissions.findMany({
        select: {
          id: true,
          name: true,
          description: true,
        },
      });

      const groupPermissionsBySuffix = (permissions: typeof allPermissions) => {
        const knownSuffixes = ["CATEGORY", "PRODUCT", "ORDER", "STAFF"];
        const grouped: { [key: string]: typeof allPermissions } = {};

        permissions.forEach((permission) => {
          const suffix = permission.name.split("_").pop() || "UNKNOWN";
          const groupKey = knownSuffixes.includes(suffix) ? suffix : "UNKNOWN";

          if (!grouped[groupKey]) {
            grouped[groupKey] = [];
          }
          grouped[groupKey].push(permission);
        });

        Object.keys(grouped).forEach((key) => {
          grouped[key].sort((a, b) => a.name.localeCompare(b.name));
        });

        const sortedGroups = Object.keys(grouped)
          .sort((a, b) => {
            const order = ["CATEGORY", "PRODUCT", "ORDER", "STAFF", "UNKNOWN"];
            return order.indexOf(a) - order.indexOf(b);
          })
          .map((key) => ({
            group: key,
            permissions: grouped[key],
          }));

        return sortedGroups;
      };

      const rolesWithAllPermissions = roles.map((role) => ({
        id: role.id,
        name: role.name,
        description: role.description,
        permissions: allPermissions.map((permission) => ({
          id: permission.id,
          name: permission.name,
          description: permission.description,
          isAssigned: role.permissions.some(
            (p) => p.permission.id === permission.id
          ),
        })),
      }));

      return {
        roles: rolesWithAllPermissions,
        permissions: groupPermissionsBySuffix(allPermissions),
      };
    }
  ),

  updateRoleAndPermissions: adminOrManageStaffProcedure
    .input(
      z.array(
        z.object({
          roleId: z.string(),
          permissionId: z.string(),
          assign: z.boolean(),
        })
      )
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.$transaction(async (tx) => {
        for (const change of input) {
          const { roleId, permissionId, assign } = change;

          if (assign) {
            await tx.role_Permissions.upsert({
              where: {
                role_id_permission_id: {
                  role_id: roleId,
                  permission_id: permissionId,
                },
              },
              create: {
                role_id: roleId,
                permission_id: permissionId,
              },
              update: {},
            });
          } else {
            await tx.role_Permissions.deleteMany({
              where: {
                role_id: roleId,
                permission_id: permissionId,
              },
            });
          }
        }
      });

      return { success: true };
    }),
});
