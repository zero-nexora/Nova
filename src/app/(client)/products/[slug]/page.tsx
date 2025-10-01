import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { ProductDetail } from "./_components/product-detail";
import { ProductSection } from "../../_components/product-section";

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
    <div>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ProductDetail slug={slug} />
        <ProductSection
          excludeSlugs={[slug]}
          title="You may also like"
          description="Discover more products that might interest you."
        />
      </HydrationBoundary>
    </div>
  );
};

export default ProductDetailPage;
