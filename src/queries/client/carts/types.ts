export interface Cart {
  id: string;
  items: {
    id: string;
    quantity: number;
    productVariant: {
      id: string;
      sku: string;
      price: number;
      stock_quantity: number;
      product: {
        id: string;
        name: string;
        slug: string;
        image_url: string | null;
      };
      attributes: {
        attributeValue: {
          value: string;
          attribute: {
            name: string;
          };
        };
      }[];
    };
  }[];
}

export interface CartItem {
  id: string;
  quantity: number;
  productVariant: {
    id: string;
    sku: string;
    price: number;
    stock_quantity: number;
    product: {
      id: string;
      name: string;
      slug: string;
      image_url: string | null;
    };
    attributes: {
      id: string;
      name: string;
      values: {
        id: string;
        value: string;
      }[];
    }[];
  };
}
