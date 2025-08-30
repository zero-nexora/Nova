import { PrismaClient, RoleName, PermissionName } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const permissionValues = Object.values(PermissionName);

  for (const perm of permissionValues) {
    await prisma.permissions.upsert({
      where: { name: perm },
      update: {},
      create: {
        name: perm,
        description: perm.replace(/_/g, " ").toLowerCase(),
      },
    });
  }

  const roleValues = Object.values(RoleName);
  for (const role of roleValues) {
    await prisma.roles.upsert({
      where: { name: role },
      update: {},
      create: {
        name: role,
        description: role.replace(/_/g, " ").toLowerCase(),
      },
    });
  }

  const allPermissions = await prisma.permissions.findMany();

  for (const role of roleValues) {
    const dbRole = await prisma.roles.findUnique({
      where: { name: role },
    });

    if (!dbRole) continue;

    let rolePermissions: PermissionName[] = [];

    if (role === RoleName.ADMIN) {
      rolePermissions = permissionValues;
    } else if (role === RoleName.MANAGE_PRODUCT) {
      rolePermissions = [
        PermissionName.READ_PRODUCT,
        PermissionName.CREATE_PRODUCT,
      ];
    } else if (role === RoleName.MANAGE_CATEGORY) {
      rolePermissions = [
        PermissionName.READ_CATEGORY,
        PermissionName.CREATE_CATEGORY,
      ];
    } else if (role === RoleName.MANAGE_STAFF) {
      rolePermissions = [
        PermissionName.READ_STAFF,
        PermissionName.CREATE_STAFF,
      ];
    } else if (role === RoleName.MANAGE_ORDER) {
      rolePermissions = [
        PermissionName.READ_ORDER,
        PermissionName.CREATE_ORDER,
      ];
    }

    for (const perm of rolePermissions) {
      const dbPerm = allPermissions.find((p) => p.name === perm);
      if (!dbPerm) continue;

      await prisma.role_Permissions.upsert({
        where: {
          role_id_permission_id: {
            role_id: dbRole.id,
            permission_id: dbPerm.id,
          },
        },
        update: {},
        create: {
          role_id: dbRole.id,
          permission_id: dbPerm.id,
        },
      });
    }
  }

  console.log("Seed data completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
