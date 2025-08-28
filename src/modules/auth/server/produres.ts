import { baseProcedure, createTRPCRouter } from "@/trpc/init";

export const authRouter = createTRPCRouter({
  test: baseProcedure.query(async ({ ctx }) => {
    return "Test Ok"
  })
})