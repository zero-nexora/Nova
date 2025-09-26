import { Product } from "@/queries/client/products/types";
import { ProductCard } from "./product-card";

interface ProductGridProps {
  products: Product[];
}

export const ProductGrid = ({ products }: ProductGridProps) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {products.map((product) => (
      <ProductCard key={product.id} product={product} />
    ))}
  </div>
);
