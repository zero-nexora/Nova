import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { CartView } from "./_components/cart-view";

const CartPage = async () => {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(
    trpc.client.cartsRouter.getCart.queryOptions()
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CartView />
    </HydrationBoundary>
  );
};

export default CartPage;
