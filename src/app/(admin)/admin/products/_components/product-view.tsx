import { ProductList } from "./product-list";
import { CreateProduct } from "./create-product";

export const ProductView = () => {
  return (
    <div className="space-y-2">
      <div className="flex gap-4">
        <CreateProduct />
      </div>
      <ProductList />
    </div>
  );
};
