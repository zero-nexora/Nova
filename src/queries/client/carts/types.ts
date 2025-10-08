export interface Cart {
  id: string;
  items: {
    id: string;
    quantity: number;
    productVariant: {
      id: string;
      sku: string;
      price: number;
      slug: string | null;
      stock_quantity: number;
      product: {
        id: string;
        name: string;
        slug: string;
        images: {
          id: string;
          image_url: string;
          public_id: string;
        }[];
      };
    };
  }[];
}
