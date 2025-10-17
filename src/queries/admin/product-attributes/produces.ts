import { adminOrManageProductProcedure, createTRPCRouter } from "@/trpc/init";
import { ProductAttribute } from "./types";

export const productAttributesRouter = createTRPCRouter({
  getAllProductAttributes: adminOrManageProductProcedure.query(
    async ({ ctx }): Promise<ProductAttribute[]> => {
      const productAttributes = await ctx.db.product_Attributes.findMany({
        where: { is_deleted: false },
        select: {
          id: true,
          name: true,
          values: {
            select: {
              id: true,
              value: true,
            },
            where: { is_deleted: false },
            orderBy: { value: "asc" },
          },
        },
      });

      return productAttributes;
    }
  ),
});
