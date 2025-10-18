import z from "zod";
import { RolePermissionData } from "./types";
import { adminOrManageStaffProcedure, createTRPCRouter } from "@/trpc/init";

export const permissionsRouter = createTRPCRouter({
  getAllRolePermissions: adminOrManageStaffProcedure.query(
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
        const grouped: { [key: string]: typeof allPermissions } = {};

        permissions.forEach((permission) => {
          const suffix = permission.name;

          if (!grouped[suffix]) {
            grouped[suffix] = [];
          }
          grouped[suffix].push(permission);
        });

        Object.keys(grouped).forEach((key) => {
          grouped[key].sort((a, b) => a.name.localeCompare(b.name));
        });

        const sortedGroups = Object.keys(grouped)
          .sort((a, b) => {
            const order = [
              "MANAGE_CATEGORY",
              "MANAGE_PRODUCT",
              "MANAGE_ROLE",
              "ADMIN",
              "CUSTOMER",
            ];
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

  updatePermissions: adminOrManageStaffProcedure
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

          const existing = await tx.role_Permissions.findUnique({
            where: {
              role_id_permission_id: {
                role_id: roleId,
                permission_id: permissionId,
              },
            },
          });

          if (assign && !existing) {
            await tx.role_Permissions.create({
              data: {
                role_id: roleId,
                permission_id: permissionId,
              },
            });
          } else if (!assign && existing) {
            await tx.role_Permissions.delete({
              where: {
                role_id_permission_id: {
                  role_id: roleId,
                  permission_id: permissionId,
                },
              },
            });
          }
        }
      });

      return { success: true };
    }),
});
