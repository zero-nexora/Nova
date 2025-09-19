// stores/productAttributesStore.ts
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
  loading: boolean;
  error: any;
  setProductAttributes: (attributes: ProductAttribute[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: any) => void;
}

export const useProductAttributesStore = create<ProductAttributesState>(
  (set) => ({
    productAttributes: [],
    loading: false,
    error: "",

    setProductAttributes: (attributes: ProductAttribute[]) =>
      set({ productAttributes: attributes }),
    setLoading: (loading: boolean) => set({ loading }),
    setError: (error: any) => set({ error }),

    reset: () =>
      set({
        productAttributes: [],
        loading: false,
        error: null,
      }),
  })
);
