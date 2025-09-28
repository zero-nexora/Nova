"use client";

import { useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { DEFAULT_LIMIT, DEFAULT_PAGE } from "@/lib/constants";
import { useTRPC } from "@/trpc/client";

export function useInvalidateProducts() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();

  const invalidate = () => {
    const page = Number(searchParams.get("page")) || DEFAULT_PAGE;

    return queryClient.invalidateQueries(
      trpc.admin.productsRouter.getAll.queryOptions({
        limit: DEFAULT_LIMIT,
        page,
      })
    );
  };

  return { invalidate };
}
