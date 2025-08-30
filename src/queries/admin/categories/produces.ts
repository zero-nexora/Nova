import { baseProcedure, createTRPCRouter } from "@/trpc/init";

export const categoriesAdminRouter = createTRPCRouter({
  getMany: baseProcedure.query(async ({ ctx }) => {
    const data = await ctx.db.categories.findMany({
      where: { is_deleted: false },
    });

    return data
  }),
});
