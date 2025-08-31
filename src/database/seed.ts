import { categoriesData } from "@/lib/constants";
import { CategorySeedType } from "@/lib/types";
import { PrismaClient, RoleName, PermissionName } from "@prisma/client";

const prisma = new PrismaClient();

// Types for better type safety
type RolePermission = {
  id: string;
  role_id: string;
  permission_id: string;
};

// Role-Permission mapping configuration
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

/**
 * Creates a human-readable description from enum value
 */
function createDescription(enumValue: string): string {
  return enumValue.replace(/_/g, " ").toLowerCase();
}

/**
 * Seeds all permissions into the database
 */
async function seedPermissions(): Promise<void> {
  prisma.permissions.deleteMany();
  console.log("Seeding permissions...");

  const permissionValues = Object.values(PermissionName);

  const upsertPromises = permissionValues.map((permission) =>
    prisma.permissions.upsert({
      where: { name: permission },
      update: {},
      create: {
        name: permission,
        description: createDescription(permission),
      },
    })
  );

  await Promise.all(upsertPromises);
  console.log(`Seeded ${permissionValues.length} permissions`);
}

/**
 * Seeds all roles into the database
 */
async function seedRoles(): Promise<void> {
  prisma.roles.deleteMany();
  console.log("Seeding roles...");

  const roleValues = Object.values(RoleName);

  const upsertPromises = roleValues.map((role) =>
    prisma.roles.upsert({
      where: { name: role },
      update: {},
      create: {
        name: role,
        description: createDescription(role),
      },
    })
  );

  await Promise.all(upsertPromises);
  console.log(`Seeded ${roleValues.length} roles`);
}

async function seedRolePermissions(): Promise<void> {
  prisma.role_Permissions.deleteMany();
  console.log("Seeding role-permission associations...");

  const allPermissions = await prisma.permissions.findMany();
  const permissionMap = new Map(allPermissions.map((p) => [p.name, p]));

  const allRoles = await prisma.roles.findMany();
  const roleMap = new Map(allRoles.map((r) => [r.name, r]));

  const rolePermissionPromises: Promise<RolePermission>[] = [];

  for (const [roleName, permissions] of Object.entries(ROLE_PERMISSIONS_MAP)) {
    const role = roleMap.get(roleName as RoleName);
    if (!role) {
      console.warn(`Role ${roleName} not found in database`);
      continue;
    }

    for (const permissionName of permissions) {
      const permission = permissionMap.get(permissionName);
      if (!permission) {
        console.warn(`Permission ${permissionName} not found in database`);
        continue;
      }

      rolePermissionPromises.push(
        prisma.role_Permissions.upsert({
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

  await Promise.all(rolePermissionPromises);
  console.log(
    `Seeded ${rolePermissionPromises.length} role-permission associations`
  );
}

async function seedCategoryRecursive(
  category: CategorySeedType,
  parentId?: string
) {
  const createdCategory = await prisma.categories.create({
    data: {
      name: category.name,
      slug: category.slug,
      parent_id: parentId,
      image_url: category.image_url,
      public_id: category.public_id
    },
  });

  if (category.children?.length) {
    await Promise.all(
      category.children.map((child: CategorySeedType) =>
        seedCategoryRecursive(child, createdCategory.id)
      )
    );
  }
}

async function seedCategories() {
  prisma.categories.deleteMany();
  console.log("Seeding categories associations...");
  for (const category of categoriesData) {
    await seedCategoryRecursive(category);
  }

  console.log(`Seeded ${categoriesData.length} role-permission associations`);
}

/**
 * Main seeding function
 */
async function main(): Promise<void> {
  try {
    console.log("🌱 Starting database seeding...");

    await seedPermissions();
    await seedRoles();
    await seedRolePermissions();
    await seedCategories();

    console.log("Seed data completed successfully!");
  } catch (error) {
    console.error("Error during seeding:", error);
    throw error;
  }
}

// Execute the seeding
main()
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  })
  .finally(async () => {
    console.log("🔌 Disconnecting from database...");
    await prisma.$disconnect();
  });
