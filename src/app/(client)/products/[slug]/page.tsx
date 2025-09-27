interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

const ProductDetailPage = async ({ params }: ProductDetailPageProps) => {
  console.log(await params);
  return <div>ProductDetailPage</div>;
};

export default ProductDetailPage;
