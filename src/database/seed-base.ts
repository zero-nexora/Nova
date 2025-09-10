import { db } from "./prisma";
import { RoleName, PermissionName } from "@prisma/client";

const ROLE_PERMISSIONS_MAP: Record<RoleName, PermissionName[]> = {
  [RoleName.ADMIN]: Object.values(PermissionName),
  [RoleName.MANAGE_PRODUCT]: [
    PermissionName.READ_PRODUCT,
    PermissionName.CREATE_PRODUCT,
  ],
  [RoleName.MANAGE_CATEGORY]: [
    PermissionName.READ_CATEGORY,
    PermissionName.CREATE_CATEGORY,
  ],
  [RoleName.MANAGE_STAFF]: [
    PermissionName.READ_STAFF,
    PermissionName.CREATE_STAFF,
  ],
  [RoleName.MANAGE_ORDER]: [
    PermissionName.READ_ORDER,
    PermissionName.CREATE_ORDER,
  ],
};

function createDescription(enumValue: string): string {
  return enumValue.replace(/_/g, " ").toLowerCase();
}

async function seedPermissions(): Promise<void> {
  await db.permissions.deleteMany();
  console.log("Seeding permissions...");

  const permissionValues = Object.values(PermissionName);

  await Promise.all(
    permissionValues.map((permission) =>
      db.permissions.upsert({
        where: { name: permission },
        update: {},
        create: {
          name: permission,
          description: createDescription(permission),
        },
      })
    )
  );

  console.log(`Seeded ${permissionValues.length} permissions`);
}

async function seedRoles(): Promise<void> {
  await db.roles.deleteMany();
  console.log("Seeding roles...");

  const roleValues = Object.values(RoleName);

  await Promise.all(
    roleValues.map((role) =>
      db.roles.upsert({
        where: { name: role },
        update: {},
        create: {
          name: role,
          description: createDescription(role),
        },
      })
    )
  );

  console.log(`Seeded ${roleValues.length} roles`);
}

async function seedRolePermissions(): Promise<void> {
  await db.role_Permissions.deleteMany();
  console.log("Seeding role-permission associations...");

  const allPermissions = await db.permissions.findMany();
  const permissionMap = new Map(allPermissions.map((p) => [p.name, p]));

  const allRoles = await db.roles.findMany();
  const roleMap = new Map(allRoles.map((r) => [r.name, r]));

  const promises: Promise<any>[] = [];

  for (const [roleName, permissions] of Object.entries(ROLE_PERMISSIONS_MAP)) {
    const role = roleMap.get(roleName as RoleName);
    if (!role) continue;

    for (const permissionName of permissions) {
      const permission = permissionMap.get(permissionName);
      if (!permission) continue;

      promises.push(
        db.role_Permissions.upsert({
          where: {
            role_id_permission_id: {
              role_id: role.id,
              permission_id: permission.id,
            },
          },
          update: {},
          create: {
            role_id: role.id,
            permission_id: permission.id,
          },
        })
      );
    }
  }

  await Promise.all(promises);
  console.log(`Seeded ${promises.length} role-permission associations`);
}

async function main(): Promise<void> {
  try {
    console.log("Starting database seeding (roles & permissions)...");

    await seedPermissions();
    await seedRoles();
    await seedRolePermissions();

    console.log("Seeding roles & permissions completed");
  } catch (error) {
    console.error("Error during seeding:", error);
    throw error;
  } finally {
    await db.$disconnect();
  }
}

main();
