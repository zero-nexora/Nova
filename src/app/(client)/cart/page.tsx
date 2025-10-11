import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { CartView, CartViewSkeleton } from "./_components/cart-view";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

const CartPage = async () => {
  const queryClient = getQueryClient();

  void queryClient.prefetchQuery(
    trpc.client.cartsRouter.getCart.queryOptions()
  );

  return (
    <main>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<CartViewSkeleton />}>
          <CartView />
        </Suspense>
      </HydrationBoundary>
    </main>
  );
};

export default CartPage;
