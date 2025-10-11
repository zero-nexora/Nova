import { Suspense } from "react";
import { getQueryClient, trpc } from "@/trpc/server";
import { Header, HeaderSkeleton } from "./_components/header/header";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import {
  CategorySection,
  CategorySectionSkeleton,
} from "./_components/category-section";

interface LayoutHomeProps {
  children: React.ReactNode;
}

export default async function LayoutClient({ children }: LayoutHomeProps) {
  const queryClient = getQueryClient();

  void Promise.all([
    queryClient.prefetchQuery(
      trpc.client.categoriesRouterClient.getAll.queryOptions()
    ),
    queryClient.prefetchQuery(
      trpc.client.usersRouter.getCurrentUser.queryOptions()
    ),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<LayoutClientSkeleton />}>
        <Header />
        <CategorySection />
      </Suspense>
      <main className="container mx-auto">{children}</main>
    </HydrationBoundary>
  );
}

const LayoutClientSkeleton = () => (
  <>
    <HeaderSkeleton />
    <CategorySectionSkeleton />
  </>
);
