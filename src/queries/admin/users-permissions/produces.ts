// import { z } from 'zod';
// import { TRPCError } from '@trpc/server';
// import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
// import { UserPermissionService, RoleName, PermissionName } from '@/lib/user-permissions';
// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// // Zod Schemas
// export const RoleNameSchema = z.nativeEnum(RoleName);
// export const PermissionNameSchema = z.nativeEnum(PermissionName);

// export const UserWithRolesSchema = z.object({
//   id: z.string(),
//   clerkId: z.string(),
//   email: z.string(),
//   first_name: z.string().nullable(),
//   last_name: z.string().nullable(),
//   image_url: z.string().nullable(),
//   roles: z.array(z.object({
//     role: z.object({
//       id: z.string(),
//       name: RoleNameSchema,
//       description: z.string().nullable(),
//       permissions: z.array(z.object({
//         permission: z.object({
//           id: z.string(),
//           name: PermissionNameSchema,
//           description: z.string().nullable(),
//         })
//       }))
//     })
//   }))
// });

// export const AssignRoleInputSchema = z.object({
//   userId: z.string(),
//   roleName: RoleNameSchema,
// });

// export const RemoveRoleInputSchema = z.object({
//   userId: z.string(),
//   roleName: RoleNameSchema,
// });

// export const UpdateUserRolesInputSchema = z.object({
//   userId: z.string(),
//   roleNames: z.array(RoleNameSchema),
// });

// export const CheckPermissionInputSchema = z.object({
//   userId: z.string(),
//   permissionName: PermissionNameSchema,
// });

// export const CheckRoleInputSchema = z.object({
//   userId: z.string(),
//   roleName: RoleNameSchema,
// });

// export const CheckMultiplePermissionsInputSchema = z.object({
//   userId: z.string(),
//   permissions: z.array(PermissionNameSchema),
// });

// export const GetUserInputSchema = z.object({
//   userId: z.string().optional(),
//   clerkId: z.string().optional(),
// }).refine((data) => data.userId || data.clerkId, {
//   message: "Either userId or clerkId must be provided",
// });

// export const UserPermissionResponseSchema = z.object({
//   hasPermission: z.boolean(),
// });

// export const UserRoleResponseSchema = z.object({
//   hasRole: z.boolean(),
// });

// export const UserRolesResponseSchema = z.object({
//   roles: z.array(RoleNameSchema),
// });

// export const UserPermissionsResponseSchema = z.object({
//   permissions: z.array(PermissionNameSchema),
// });

// // Helper function để kiểm tra quyền truy cập
// const checkAccessPermission = async (currentUserId: string, targetUserId: string) => {
//   const isAdmin = await UserPermissionService.hasRole(currentUserId, RoleName.ADMIN);
//   const isSelfRequest = targetUserId === currentUserId;
//   return isAdmin || isSelfRequest;
// };

// const checkStaffManagementPermission = async (userId: string) => {
//   const isAdmin = await UserPermissionService.hasRole(userId, RoleName.ADMIN);
//   const canManageStaff = await UserPermissionService.hasPermission(userId, PermissionName.UPDATE_STAFF);
//   return isAdmin || canManageStaff;
// };

// // tRPC Procedures
// export const getUserWithPermissions = protectedProcedure
//   .input(GetUserInputSchema)
//   .output(UserWithRolesSchema.nullable())
//   .query(async ({ input, ctx }) => {
//     try {
//       const targetUserId = input.userId || '';
      
//       if (!await checkAccessPermission(ctx.user.id, targetUserId)) {
//         throw new TRPCError({
//           code: 'FORBIDDEN',
//           message: 'You can only view your own permissions or need admin role',
//         });
//       }

//       let user;
//       if (input.userId) {
//         user = await UserPermissionService.getUserWithPermissions(input.userId);
//       } else if (input.clerkId) {
//         user = await UserPermissionService.getUserByClerkId(input.clerkId);
//       }

//       return user;
//     } catch (error) {
//       console.error('Error in getUserWithPermissions:', error);
//       throw new TRPCError({
//         code: 'INTERNAL_SERVER_ERROR',
//         message: 'Failed to get user permissions',
//       });
//     }
//   });

// export const checkPermission = protectedProcedure
//   .input(CheckPermissionInputSchema)
//   .output(UserPermissionResponseSchema)
//   .query(async ({ input, ctx }) => {
//     try {
//       if (!await checkAccessPermission(ctx.user.id, input.userId)) {
//         throw new TRPCError({
//           code: 'FORBIDDEN',
//           message: 'You can only check your own permissions or need admin role',
//         });
//       }

//       const hasPermission = await UserPermissionService.hasPermission(
//         input.userId,
//         input.permissionName
//       );

//       return { hasPermission };
//     } catch (error) {
//       console.error('Error in checkPermission:', error);
//       throw new TRPCError({
//         code: 'INTERNAL_SERVER_ERROR',
//         message: 'Failed to check permission',
//       });
//     }
//   });

// export const checkRole = protectedProcedure
//   .input(CheckRoleInputSchema)
//   .output(UserRoleResponseSchema)
//   .query(async ({ input, ctx }) => {
//     try {
//       if (!await checkAccessPermission(ctx.user.id, input.userId)) {
//         throw new TRPCError({
//           code: 'FORBIDDEN',
//           message: 'You can only check your own roles or need admin role',
//         });
//       }

//       const hasRole = await UserPermissionService.hasRole(input.userId, input.roleName);

//       return { hasRole };
//     } catch (error) {
//       console.error('Error in checkRole:', error);
//       throw new TRPCError({
//         code: 'INTERNAL_SERVER_ERROR',
//         message: 'Failed to check role',
//       });
//     }
//   });

// export const checkAnyPermission = protectedProcedure
//   .input(CheckMultiplePermissionsInputSchema)
//   .output(UserPermissionResponseSchema)
//   .query(async ({ input, ctx }) => {
//     try {
//       if (!await checkAccessPermission(ctx.user.id, input.userId)) {
//         throw new TRPCError({
//           code: 'FORBIDDEN',
//           message: 'You can only check your own permissions or need admin role',
//         });
//       }

//       const hasPermission = await UserPermissionService.hasAnyPermission(
//         input.userId,
//         input.permissions
//       );

//       return { hasPermission };
//     } catch (error) {
//       console.error('Error in checkAnyPermission:', error);
//       throw new TRPCError({
//         code: 'INTERNAL_SERVER_ERROR',
//         message: 'Failed to check permissions',
//       });
//     }
//   });

// export const checkAllPermissions = protectedProcedure
//   .input(CheckMultiplePermissionsInputSchema)
//   .output(UserPermissionResponseSchema)
//   .query(async ({ input, ctx }) => {
//     try {
//       if (!await checkAccessPermission(ctx.user.id, input.userId)) {
//         throw new TRPCError({
//           code: 'FORBIDDEN',
//           message: 'You can only check your own permissions or need admin role',
//         });
//       }

//       const hasPermission = await UserPermissionService.hasAllPermissions(
//         input.userId,
//         input.permissions
//       );

//       return { hasPermission };
//     } catch (error) {
//       console.error('Error in checkAllPermissions:', error);
//       throw new TRPCError({
//         code: 'INTERNAL_SERVER_ERROR',
//         message: 'Failed to check permissions',
//       });
//     }
//   });

// export const getUserRoles = protectedProcedure
//   .input(z.object({ userId: z.string() }))
//   .output(UserRolesResponseSchema)
//   .query(async ({ input, ctx }) => {
//     try {
//       if (!await checkAccessPermission(ctx.user.id, input.userId)) {
//         throw new TRPCError({
//           code: 'FORBIDDEN',
//           message: 'You can only view your own roles or need admin role',
//         });
//       }

//       const roles = await UserPermissionService.getUserRoles(input.userId);

//       return { roles };
//     } catch (error) {
//       console.error('Error in getUserRoles:', error);
//       throw new TRPCError({
//         code: 'INTERNAL_SERVER_ERROR',
//         message: 'Failed to get user roles',
//       });
//     }
//   });

// export const getUserPermissions = protectedProcedure
//   .input(z.object({ userId: z.string() }))
//   .output(UserPermissionsResponseSchema)
//   .query(async ({ input, ctx }) => {
//     try {
//       if (!await checkAccessPermission(ctx.user.id, input.userId)) {
//         throw new TRPCError({
//           code: 'FORBIDDEN',
//           message: 'You can only view your own permissions or need admin role',
//         });
//       }

//       const permissions = await UserPermissionService.getUserPermissions(input.userId);

//       return { permissions };
//     } catch (error) {
//       console.error('Error in getUserPermissions:', error);
//       throw new TRPCError({
//         code: 'INTERNAL_SERVER_ERROR',
//         message: 'Failed to get user permissions',
//       });
//     }
//   });

// export const assignRole = protectedProcedure
//   .input(AssignRoleInputSchema)
//   .output(z.object({ success: z.boolean() }))
//   .mutation(async ({ input, ctx }) => {
//     try {
//       if (!await checkStaffManagementPermission(ctx.user.id)) {
//         throw new TRPCError({
//           code: 'FORBIDDEN',
//           message: 'You need admin role or manage staff permission',
//         });
//       }

//       const success = await UserPermissionService.assignRole(
//         input.userId,
//         input.roleName
//       );

//       if (!success) {
//         throw new TRPCError({
//           code: 'BAD_REQUEST',
//           message: 'Failed to assign role',
//         });
//       }

//       return { success };
//     } catch (error) {
//       console.error('Error in assignRole:', error);
//       throw new TRPCError({
//         code: 'INTERNAL_SERVER_ERROR',
//         message: 'Failed to assign role',
//       });
//     }
//   });

// export const removeRole = protectedProcedure
//   .input(RemoveRoleInputSchema)
//   .output(z.object({ success: z.boolean() }))
//   .mutation(async ({ input, ctx }) => {
//     try {
//       if (!await checkStaffManagementPermission(ctx.user.id)) {
//         throw new TRPCError({
//           code: 'FORBIDDEN',
//           message: 'You need admin role or manage staff permission',
//         });
//       }

//       // Không cho phép gỡ role admin của chính mình
//       if (input.roleName === RoleName.ADMIN && input.userId === ctx.user.id) {
//         throw new TRPCError({
//           code: 'BAD_REQUEST',
//           message: 'You cannot remove admin role from yourself',
//         });
//       }

//       const success = await UserPermissionService.removeRole(
//         input.userId,
//         input.roleName
//       );

//       if (!success) {
//         throw new TRPCError({
//           code: 'BAD_REQUEST',
//           message: 'Failed to remove role',
//         });
//       }

//       return { success };
//     } catch (error) {
//       console.error('Error in removeRole:', error);
//       throw new TRPCError({
//         code: 'INTERNAL_SERVER_ERROR',
//         message: 'Failed to remove role',
//       });
//     }
//   });

// export const updateUserRoles = protectedProcedure
//   .input(UpdateUserRolesInputSchema)
//   .output(z.object({ success: z.boolean() }))
//   .mutation(async ({ input, ctx }) => {
//     try {
//       const isAdmin = await UserPermissionService.hasRole(ctx.user.id, RoleName.ADMIN);
      
//       if (!isAdmin) {
//         throw new TRPCError({
//           code: 'FORBIDDEN',
//           message: 'You need admin role to update user roles',
//         });
//       }

//       // Không cho phép gỡ role admin của chính mình
//       if (input.userId === ctx.user.id && !input.roleNames.includes(RoleName.ADMIN)) {
//         throw new TRPCError({
//           code: 'BAD_REQUEST',
//           message: 'You cannot remove admin role from yourself',
//         });
//       }

//       const success = await UserPermissionService.updateUserRoles(
//         input.userId,
//         input.roleNames
//       );

//       if (!success) {
//         throw new TRPCError({
//           code: 'BAD_REQUEST',
//           message: 'Failed to update user roles',
//         });
//       }

//       return { success };
//     } catch (error) {
//       console.error('Error in updateUserRoles:', error);
//       throw new TRPCError({
//         code: 'INTERNAL_SERVER_ERROR',
//         message: 'Failed to update user roles',
//       });
//     }
//   });

// export const getAllUsersWithRoles = protectedProcedure
//   .input(z.object({
//     page: z.number().min(1).default(1),
//     limit: z.number().min(1).max(100).default(10),
//     search: z.string().optional(),
//   }))
//   .output(z.object({
//     users: z.array(UserWithRolesSchema),
//     total: z.number(),
//     totalPages: z.number(),
//   }))
//   .query(async ({ input, ctx }) => {
//     try {
//       const isAdmin = await UserPermissionService.hasRole(ctx.user.id, RoleName.ADMIN);
//       const canReadStaff = await UserPermissionService.hasPermission(
//         ctx.user.id,
//         PermissionName.READ_STAFF
//       );
      
//       if (!isAdmin && !canReadStaff) {
//         throw new TRPCError({
//           code: 'FORBIDDEN',
//           message: 'You need admin role or read staff permission',
//         });
//       }

//       const { page, limit, search } = input;
//       const skip = (page - 1) * limit;

//       const where = {
//         is_deleted: false,
//         ...(search && {
//           OR: [
//             { first_name: { contains: search, mode: 'insensitive' } },
//             { last_name: { contains: search, mode: 'insensitive' } },
//             { email: { contains: search, mode: 'insensitive' } },
//           ],
//         }),
//       };

//       const [users, total] = await Promise.all([
//         prisma.users.findMany({
//           where,
//           skip,
//           take: limit,
//           include: {
//             roles: {
//               include: {
//                 role: {
//                   include: {
//                     permissions: {
//                       include: {
//                         permission: true,
//                       },
//                     },
//                   },
//                 },
//               },
//             },
//           },
//           orderBy: { created_at: 'desc' },
//         }),
//         prisma.users.count({ where }),
//       ]);

//       const totalPages = Math.ceil(total / limit);

//       return {
//         users,
//         total,
//         totalPages,
//       };
//     } catch (error) {
//       console.error('Error in getAllUsersWithRoles:', error);
//       throw new TRPCError({
//         code: 'INTERNAL_SERVER_ERROR',
//         message: 'Failed to get users with roles',
//       });
//     }
//   });

// export const getAllRoles = protectedProcedure
//   .output(z.array(z.object({
//     id: z.string(),
//     name: RoleNameSchema,
//     description: z.string().nullable(),
//     permissions: z.array(z.object({
//       permission: z.object({
//         id: z.string(),
//         name: PermissionNameSchema,
//         description: z.string().nullable(),
//       })
//     }))
//   })))
//   .query(async ({ ctx }) => {
//     try {
//       const isAdmin = await UserPermissionService.hasRole(ctx.user.id, RoleName.ADMIN);
//       const canReadStaff = await UserPermissionService.hasPermission(
//         ctx.user.id,
//         PermissionName.READ_STAFF
//       );
      
//       if (!isAdmin && !canReadStaff) {
//         throw new TRPCError({
//           code: 'FORBIDDEN',
//           message: 'You need admin role or read staff permission',
//         });
//       }

//       const roles = await prisma.roles.findMany({
//         include: {
//           permissions: {
//             include: {
//               permission: true,
//             },
//           },
//         },
//         orderBy: { name: 'asc' },
//       });

//       return roles;
//     } catch (error) {
//       console.error('Error in getAllRoles:', error);
//       throw new TRPCError({
//         code: 'INTERNAL_SERVER_ERROR',
//         message: 'Failed to get roles',
//       });
//     }
//   });

// export const getAllPermissions = protectedProcedure
//   .output(z.array(z.object({
//     id: z.string(),
//     name: PermissionNameSchema,
//     description: z.string().nullable(),
//   })))
//   .query(async ({ ctx }) => {
//     try {
//       const isAdmin = await UserPermissionService.hasRole(ctx.user.id, RoleName.ADMIN);
      
//       if (!isAdmin) {
//         throw new TRPCError({
//           code: 'FORBIDDEN',
//           message: 'You need admin role to view permissions',
//         });
//       }

//       const permissions = await prisma.permissions.findMany({
//         orderBy: { name: 'asc' },
//       });

//       return permissions;
//     } catch (error) {
//       console.error('Error in getAllPermissions:', error);
//       throw new TRPCError({
//         code: 'INTERNAL_SERVER_ERROR',
//         message: 'Failed to get permissions',
//       });
//     }
//   });

// // Export tRPC Router
// export const userPermissionRouter = createTRPCRouter({
//   getUserWithPermissions,
//   checkPermission,
//   checkRole,
//   checkAnyPermission,
//   checkAllPermissions,
//   getUserRoles,
//   getUserPermissions,
//   assignRole,
//   removeRole,
//   updateUserRoles,
//   getAllUsersWithRoles,
//   getAllRoles,
//   getAllPermissions,
// });