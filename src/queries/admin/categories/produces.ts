import { CategoryColumn, CategoryWithChildren } from "@/lib/types";
import { adminOrManageCategoryProcedure, createTRPCRouter } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import {
  createCategorySchema,
  deleteCategorySchema,
  getCategoryByIdSchema,
  getCategoryBySlugSchema,
  updateCategorySchema,
} from "./types";
import slugify from "slugify";
import z from "zod";

export const categoriesAdminRouter = createTRPCRouter({
  getAll: adminOrManageCategoryProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        search: z.string().optional(),
        sortBy: z.string().optional(),
        sortOrder: z.enum(["asc", "desc"]).default("desc"),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const { page, limit, search, sortBy = "created_at", sortOrder } = input;

        const offset = (page - 1) * limit;

        const whereClause: any = {
          is_deleted: false, // Only get non-deleted categories
        };

        if (search) {
          whereClause.OR = [
            { name: { contains: search, mode: "insensitive" } },
            { slug: { contains: search, mode: "insensitive" } },
          ];
        }

        const [categories, totalItems] = await Promise.all([
          ctx.db.categories.findMany({
            where: whereClause,
            orderBy: { [sortBy]: sortOrder },
            skip: offset,
            take: limit,
            include: {
              parent: {
                select: {
                  id: true,
                  name: true,
                },
              },
              children: {
                where: { is_deleted: false },
                select: {
                  id: true,
                  name: true,
                },
              },
              _count: {
                select: {
                  products: {
                    where: { is_deleted: false },
                  },
                },
              },
            },
          }),
          ctx.db.categories.count({ where: whereClause }),
        ]);

        const totalPages = Math.ceil(totalItems / limit);

        // Transform the data to match your CategoryColumn interface
        const transformedData = categories.map((category) => ({
          id: category.id,
          name: category.name,
          slug: category.slug,
          parentName: category.parent?.name || null,
          parentId: category.parent_id,
          image_url: category.image_url,
          public_id: category.public_id,
          created_at: category.created_at,
          updated_at: category.updated_at,
          is_deleted: category.is_deleted,
          deleted_at: category.deleted_at,
          childrenCount: category.children.length,
          productsCount: category._count.products,
          // Include children info if needed
          children: category.children,
        }));

        return {
          data: transformedData,
          pagination: {
            currentPage: page,
            totalPages,
            totalItems,
            pageSize: limit,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
          },
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get all categories",
        });
      }
    }),

  getById: adminOrManageCategoryProcedure
    .input(getCategoryByIdSchema)
    .query(async ({ ctx, input }) => {
      const category = await ctx.db.categories.findFirst({
        where: { id: input.id, is_deleted: false },
        include: {
          parent: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          children: {
            where: {
              is_deleted: false,
            },
            select: {
              id: true,
              name: true,
              slug: true,
              image_url: true,
              _count: {
                select: {
                  products: true,
                  children: {
                    where: { is_deleted: false },
                  },
                },
              },
            },
          },
          _count: {
            select: {
              products: true,
              children: {
                where: { is_deleted: false },
              },
            },
          },
        },
      });

      if (!category)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found",
        });

      return category;
    }),

  getBySlug: adminOrManageCategoryProcedure
    .input(getCategoryBySlugSchema)
    .query(async ({ ctx, input }) => {
      const category = await ctx.db.categories.findFirst({
        where: { slug: input.slug },
        include: {
          parent: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          children: {
            where: { is_deleted: false },
            select: {
              id: true,
              name: true,
              slug: true,
              image_url: true,
              _count: {
                select: {
                  products: true,
                  children: {
                    where: { is_deleted: false },
                  },
                },
              },
            },
          },
          _count: {
            select: {
              products: true,
              children: {
                where: { is_deleted: false },
              },
            },
          },
        },
      });

      if (!category)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found",
        });

      return category;
    }),

  // getTree: adminOrManageCategoryProcedure
  //   .input(
  //     z.object({
  //       max_depth: z.number().min(1).max(5).default(3),
  //     })
  //   )
  //   .query(async ({ ctx, input }) => {
  //     const rootCategories = await ctx.db.categories.findMany({
  //       where: {
  //         parent_id: null,
  //         is_deleted: false,
  //       },
  //       include: {
  //         children: {
  //           where: { is_deleted: false },
  //           include: {
  //             children:
  //               input.max_depth > 2
  //                 ? {
  //                     where: { is_deleted: false },
  //                     include:
  //                       input.max_depth > 3
  //                         ? {
  //                             children: {
  //                               where: { is_deleted: false },
  //                             },
  //                           }
  //                         : undefined,
  //                   }
  //                 : undefined,
  //             _count: {
  //               select: {
  //                 products: true,
  //                 children: {
  //                   where: { is_deleted: false },
  //                 },
  //               },
  //             },
  //           },
  //         },
  //         _count: {
  //           select: {
  //             products: true,
  //             children: {
  //               where: { is_deleted: false },
  //             },
  //           },
  //         },
  //       },
  //       orderBy: {
  //         name: "asc",
  //       },
  //     });

  //     return rootCategories;
  //   }),

  create: adminOrManageCategoryProcedure
    .input(createCategorySchema)
    .mutation(async ({ ctx, input }) => {
      const { name, image_url, parent_id, public_id } = input;
      try {
        const baseSlug = slugify(name, {
          lower: true,
          strict: true,
        });

        let slug = baseSlug;
        let counter = 1;

        while (true) {
          const existingCategory = await ctx.db.categories.findUnique({
            where: { slug: baseSlug },
          });

          if (!existingCategory || existingCategory.is_deleted) break;

          slug = `${baseSlug}-${counter}`;
          counter++;
        }

        if (parent_id) {
          const parentCategory = await ctx.db.categories.findFirst({
            where: { id: parent_id, is_deleted: false },
          });

          if (!parentCategory)
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Parent category does not exist",
            });
        }

        const category = await ctx.db.categories.create({
          data: {
            name,
            parent_id,
            public_id,
            image_url,
            slug,
          },
        });

        return category;
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create category",
        });
      }
    }),

  update: adminOrManageCategoryProcedure
    .input(updateCategorySchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;
      try {
        const existingCategory = await ctx.db.categories.findFirst({
          where: { id, is_deleted: false },
        });

        if (!existingCategory)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Category not found",
          });

        let newSlug = "";

        if (updateData.name && updateData.name !== existingCategory.name) {
          const baseSlug = slugify(updateData.name, {
            lower: true,
            strict: true,
          });

          newSlug = baseSlug;
          let counter = 1;

          while (true) {
            const slugExistings = await ctx.db.categories.findFirst({
              where: {
                slug: newSlug,
                id: { not: id },
                is_deleted: false,
              },
            });

            if (!slugExistings) break;

            newSlug = `${newSlug}-${counter}`;
            counter++;
          }
        }

        const category = await ctx.db.categories.update({
          where: { id },
          data: {
            ...updateData,
            slug: newSlug,
          },
        });

        return category;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update category",
        });
      }
    }),

  delete: adminOrManageCategoryProcedure
    .input(deleteCategorySchema)
    .mutation(async ({ ctx, input }) => {
      const { id, hard_delete } = input;

      try {
        const category = await ctx.db.categories.delete({
          where: { id, ...(hard_delete ? {} : { is_deleted: false }) },
        });

        if (!category) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Category not found",
          });
        }

        if (hard_delete) {
          const deletedCategory = await ctx.db.categories.delete({
            where: { id },
          });

          return deletedCategory;
        } else {
          const updatedCategory = await ctx.db.categories.update({
            where: { id },
            data: { is_deleted: true, deleted_at: new Date() },
          });

          return updatedCategory;
        }
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete category",
        });
      }
    }),

  restore: adminOrManageCategoryProcedure
    .input(getCategoryByIdSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const category = await ctx.db.categories.findFirst({
          where: {
            id: input.id,
            is_deleted: true,
          },
        });

        if (!category) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Deleted category not found",
          });
        }

        const slugConflic = await ctx.db.categories.findFirst({
          where: {
            slug: category.slug,
            is_deleted: false,
            id: { not: input.id },
          },
        });

        let newSlug = "";

        if (slugConflic) {
          const baseSlug = slugify(category.name, {
            lower: true,
            strict: true,
          });

          newSlug = baseSlug;
          let counter = 1;

          while (true) {
            const slugExistings = await ctx.db.categories.findFirst({
              where: {
                slug: newSlug,
                id: { not: input.id },
                is_deleted: false,
              },
            });

            if (!slugExistings) break;

            newSlug = `${newSlug}-${counter}`;
            counter++;
          }
        }

        const restoredCategory = await ctx.db.categories.update({
          where: { id: input.id },
          data: {
            is_deleted: false,
            deleted_at: null,
            slug: newSlug,
          },
        });

        return restoredCategory;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to restore category",
        });
      }
    }),

  // move: publicProcedure
  //   .input(z.object({
  //     id: z.string().uuid(),
  //     new_parent_id: z.string().uuid().optional().nullable(),
  //   }))
  //   .mutation(async ({ ctx, input }) => {
  //     const { id, new_parent_id } = input;

  //     try {
  //       const category = await ctx.prisma.categories.findFirst({
  //         where: {
  //           id,
  //           is_deleted: false,
  //         },
  //       });

  //       if (!category) {
  //         throw new TRPCError({
  //           code: 'NOT_FOUND',
  //           message: 'Category not found',
  //         });
  //       }

  //       if (new_parent_id) {
  //         const parentExists = await ctx.prisma.categories.findFirst({
  //           where: {
  //             id: new_parent_id,
  //             is_deleted: false,
  //           },
  //         });

  //         if (!parentExists) {
  //           throw new TRPCError({
  //             code: 'NOT_FOUND',
  //             message: 'Parent category does not exist',
  //           });
  //         }

  //         if (new_parent_id === id) {
  //           throw new TRPCError({
  //             code: 'BAD_REQUEST',
  //             message: 'Category cannot be its own parent',
  //           });
  //         }

  //         // Check for cycles
  //         const wouldCreateCycle = await checkForCycle(
  //           ctx.prisma,
  //           id,
  //           new_parent_id
  //         );

  //         if (wouldCreateCycle) {
  //           throw new TRPCError({
  //             code: 'BAD_REQUEST',
  //             message: 'Cannot create circular reference in category tree',
  //           });
  //         }
  //       }

  //       const updatedCategory = await ctx.prisma.categories.update({
  //         where: { id },
  //         data: {
  //           parent_id: new_parent_id,
  //           updated_at: new Date(),
  //         },
  //         include: {
  //           parent: {
  //             select: {
  //               id: true,
  //               name: true,
  //               slug: true,
  //             },
  //           },
  //           children: {
  //             where: { is_deleted: false },
  //           },
  //         },
  //       });

  //       return updatedCategory;
  //     } catch (error) {
  //       if (error instanceof TRPCError) {
  //         throw error;
  //       }
  //       throw new TRPCError({
  //         code: 'INTERNAL_SERVER_ERROR',
  //         message: 'Failed to move category',
  //       });
  //     }
  //   }),

  // // Get category breadcrumb
  // getBreadcrumb: publicProcedure
  //   .input(getCategorySchema)
  //   .query(async ({ ctx, input }) => {
  //     const breadcrumb: Array<{
  //       id: string;
  //       name: string;
  //       slug: string;
  //     }> = [];

  //     let currentId = input.id;

  //     while (currentId) {
  //       const category = await ctx.prisma.categories.findFirst({
  //         where: {
  //           id: currentId,
  //           is_deleted: false,
  //         },
  //         select: {
  //           id: true,
  //           name: true,
  //           slug: true,
  //           parent_id: true,
  //         },
  //       });

  //       if (!category) {
  //         break;
  //       }

  //       breadcrumb.unshift({
  //         id: category.id,
  //         name: category.name,
  //         slug: category.slug,
  //       });

  //       currentId = category.parent_id;
  //     }

  //     return breadcrumb;
  //   }),
});
