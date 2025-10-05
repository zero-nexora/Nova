import { getQueryClient, trpc } from "@/trpc/server";
import { ProductDetail } from "./_components/product-detail";
import { ProductSection } from "../../_components/product-section";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

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
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductDetail slug={slug} />
      <ProductSection
        excludeSlugs={[slug]}
        title="You may also like"
        description="Discover more products that might interest you."
      />
    </HydrationBoundary>
  );
};

export default ProductDetailPage;
