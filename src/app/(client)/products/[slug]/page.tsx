import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { ProductDetail } from "./_components/product-detail";

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

const ProductDetailPage = async ({ params }: ProductDetailPageProps) => {
  const { slug } = await params;
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(
    trpc.client.productsRouterClient.getBySlug.queryOptions({ slug })
  );

  return (
    <div className="min-h-screen">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ProductDetail slug={slug} />
      </HydrationBoundary>
    </div>
  );
};

export default ProductDetailPage;
