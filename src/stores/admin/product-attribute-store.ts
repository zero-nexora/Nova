import { create } from "zustand";

export interface ProductAttributeValue {
  id: string;
  value: string;
}

export interface ProductAttribute {
  id: string;
  name: string;
  values: ProductAttributeValue[];
}

interface ProductAttributesState {
  productAttributes: ProductAttribute[];
  setProductAttributes: (attributes: ProductAttribute[]) => void;
}

export const useProductAttributesStore = create<ProductAttributesState>(
  (set) => ({
    productAttributes: [],

    setProductAttributes: (attributes: ProductAttribute[]) =>
      set({ productAttributes: attributes }),
  })
);
