// Custom hook for managing product variants
import { createDefaultVariant, ProductVariant } from "@/lib/utils";
import { useCallback, useState } from "react";

interface UseProductVariantsProps {
  initialVariants?: ProductVariant[];
}

export const useProductVariants = ({
  initialVariants,
}: UseProductVariantsProps = {}) => {
  const [variants, setVariants] = useState<ProductVariant[]>(
    initialVariants || [createDefaultVariant()]
  );

  const addVariant = useCallback(() => {
    setVariants((prev) => [...prev, createDefaultVariant()]);
  }, []);

  const removeVariant = useCallback((variantId: string) => {
    setVariants((prev) =>
      prev.length > 1 ? prev.filter((v) => v.id !== variantId) : prev
    );
  }, []);

  const updateVariant = useCallback(
    (variantId: string, field: keyof ProductVariant, value: any) => {
      setVariants((prev) =>
        prev.map((v) => (v.id === variantId ? { ...v, [field]: value } : v))
      );
    },
    []
  );

  const updateAttributeValue = useCallback(
    (
      variantId: string,
      attributeId: string,
      valueId: string,
      attributeValues: any[]
    ) => {
      setVariants((prev) =>
        prev.map((variant) => {
          if (variant.id !== variantId) return variant;

          const existingValueIds = attributeValues.map((v) => v.id);
          const filteredIds = variant.attributeValueIds.filter(
            (id) => !existingValueIds.includes(id)
          );

          if (valueId && valueId !== "none") {
            filteredIds.push(valueId);
          }

          return { ...variant, attributeValueIds: filteredIds };
        })
      );
    },
    []
  );

  const getSelectedAttributeValue = useCallback(
    (variantId: string, attributeId: string, productAttributes: any[]) => {
      const variant = variants.find((v) => v.id === variantId);
      if (!variant) return "";

      const attribute = productAttributes.find(
        (attr) => attr.id === attributeId
      );
      if (!attribute) return "";

      const selectedValueId = variant.attributeValueIds.find((valueId) =>
        attribute.values.some((v: any) => v.id === valueId)
      );

      return selectedValueId || "";
    },
    [variants]
  );

  const resetVariants = useCallback(() => {
    setVariants([createDefaultVariant()]);
  }, []);

  return {
    variants,
    setVariants,
    addVariant,
    removeVariant,
    updateVariant,
    updateAttributeValue,
    getSelectedAttributeValue,
    resetVariants,
  };
};
