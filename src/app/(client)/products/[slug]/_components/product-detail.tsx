"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  Heart,
  ShoppingCart,
  Star,
  Minus,
  Plus,
  Check,
  Slash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useGetProductBySlug } from "../hooks/use-get-product-by-slug";
import {
  ProductAttribute,
  ProductAttributeValue,
  Variant,
} from "@/queries/client/products/types";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatUSD } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import { ImageCarousel } from "./image-carousel";
import { placeholderImage } from "@/lib/constants";
import { Error } from "@/components/global/error";
import { NotFound } from "@/components/global/not-found";
import { useAddToCart } from "@/app/(client)/cart/hooks/use-add-to-cart";
import { useToggleWishlist } from "@/app/(client)/wishlist/hooks/use-toggle-wishlist";

interface ProductDetailProps {
  slug: string;
}

type SelectedAttributes = Record<string, string>;

const createVariantAttributeMap = (variant: Variant): Map<string, string> => {
  return new Map(
    variant.attributes.map((attr) => [
      attr.attributeValue.attribute.id,
      attr.attributeValue.id,
    ])
  );
};

const variantsMatch = (
  variant: Variant,
  selections: SelectedAttributes
): boolean => {
  if (Object.keys(selections).length === 0) return false;

  const variantAttrMap = createVariantAttributeMap(variant);

  const allSelectionsMatch = Object.entries(selections).every(
    ([attrId, valueId]) => variantAttrMap.get(attrId) === valueId
  );

  if (!allSelectionsMatch) return false;

  const isSingleAttr = variant.attributes.length === 1;
  const sameAttrCount =
    variant.attributes.length === Object.keys(selections).length;

  return isSingleAttr || sameAttrCount;
};

export const ProductDetail = ({ slug }: ProductDetailProps) => {
  const { addToCartAsync, isPending: addToCartIsPending } = useAddToCart();
  const { toggleWishlistAsync, isPending: wishlistIsPending } =
    useToggleWishlist();
  const { product, error } = useGetProductBySlug(slug);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedAttributes, setSelectedAttributes] =
    useState<SelectedAttributes>({});

  const findMatchingVariant = useCallback(
    (selections: SelectedAttributes): Variant | undefined => {
      if (!product?.variants?.length) return undefined;
      return product.variants.find((v) => variantsMatch(v, selections));
    },
    [product?.variants]
  );

  const getAvailableValues = useCallback(
    (attributeId: string, tempSelections: SelectedAttributes): Set<string> => {
      if (!product?.variants?.length) return new Set();

      const availableValueIds = new Set<string>();

      const singleAttrVariant = product.variants.find((v) => {
        if (v.attributes.length !== 1) return false;
        const attr = v.attributes[0];
        return (
          tempSelections[attr.attributeValue.attribute.id] ===
          attr.attributeValue.id
        );
      });

      if (
        singleAttrVariant &&
        singleAttrVariant.attributes[0]?.attributeValue?.attribute?.id ===
          attributeId
      ) {
        const valueId = singleAttrVariant.attributes[0]?.attributeValue?.id;
        if (valueId) availableValueIds.add(valueId);
        return availableValueIds;
      }

      const compatibleVariants = product.variants.filter((variant) => {
        const hasAttribute = variant.attributes?.some?.(
          (attr) => attr?.attributeValue?.attribute?.id === attributeId
        );

        if (!hasAttribute) return false;

        const matchesSelections = variant.attributes?.every?.((variantAttr) => {
          const variantAttrId = variantAttr?.attributeValue?.attribute?.id;
          if (!variantAttrId) return false;

          if (variantAttrId === attributeId) return true;

          const selectedValue = tempSelections[variantAttrId];
          return (
            !selectedValue || selectedValue === variantAttr?.attributeValue?.id
          );
        });

        return !!matchesSelections;
      });

      compatibleVariants.forEach((variant) => {
        variant.attributes?.forEach?.((variantAttr) => {
          if (variantAttr?.attributeValue?.attribute?.id === attributeId) {
            const valueId = variantAttr?.attributeValue?.id;
            if (valueId) availableValueIds.add(valueId);
          }
        });
      });

      return availableValueIds;
    },
    [product?.variants]
  );

  const handleAttributeChange = useCallback(
    (attributeId: string, valueId: string) => {
      setSelectedAttributes((prev) => {
        if (prev[attributeId] === valueId) {
          const updated = { ...prev };
          delete updated[attributeId];
          return updated;
        }

        const updated = { ...prev, [attributeId]: valueId };

        Object.keys(updated).forEach((attrId) => {
          if (attrId !== attributeId) {
            const available = getAvailableValues(attrId, updated);
            if (!available.has(updated[attrId])) {
              delete updated[attrId];
            }
          }
        });

        return updated;
      });
    },
    [getAvailableValues]
  );

  const currentVariant = useMemo(
    () => findMatchingVariant(selectedAttributes),
    [selectedAttributes, findMatchingVariant]
  );

  const currentPrice = useMemo(
    () => (currentVariant?.price ? currentVariant.price / 100 : 0),
    [currentVariant?.price]
  );

  const currentStock = useMemo(
    () => currentVariant?.stock_quantity ?? 0,
    [currentVariant?.stock_quantity]
  );

  const hasEnoughSelections = useMemo(() => {
    if (!currentVariant) return false;

    const requiredAttrCount = currentVariant.attributes?.length ?? 0;
    const selectedAttrCount = Object.keys(selectedAttributes).length;

    if (requiredAttrCount === 1) {
      const attrId =
        currentVariant.attributes?.[0]?.attributeValue?.attribute?.id;
      return attrId ? !!selectedAttributes[attrId] : false;
    }

    return selectedAttrCount === requiredAttrCount;
  }, [currentVariant, selectedAttributes]);

  const canAddToCart = useMemo(
    () =>
      hasEnoughSelections &&
      !!currentVariant &&
      currentStock > 0 &&
      quantity > 0,
    [hasEnoughSelections, currentVariant, currentStock, quantity]
  );

  const handleQuantityChange = useCallback(
    (type: "increment" | "decrement") => {
      setQuantity((prev) => {
        if (type === "increment") {
          return currentVariant && prev < currentStock ? prev + 1 : prev;
        }
        return prev > 1 ? prev - 1 : prev;
      });
    },
    [currentVariant, currentStock]
  );

  const handleAddToCart = useCallback(async () => {
    if (!currentVariant || !canAddToCart) return;
    await addToCartAsync({
      productVariantId: currentVariant.id,
      quantity,
    });
  }, [currentVariant, canAddToCart, quantity, addToCartAsync]);

  const handleToggleWishlist = useCallback(async () => {
    if (!product?.id) return;
    await toggleWishlistAsync({ productId: product.id });
  }, [product?.id, toggleWishlistAsync]);

  if (error) return <Error />;
  if (!product) return <NotFound />;

  const productImages = product.images ?? [];
  const currentImageUrl =
    productImages[selectedImageIndex]?.image_url ?? placeholderImage;
  const hasMultipleImages = productImages.length > 1;
  const productAttributes = product.attributes ?? [];

  const addToCartButtonText = !hasEnoughSelections
    ? "Select Options"
    : currentStock === 0
    ? "Out of Stock"
    : "Add to Cart";

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="flex flex-col gap-4">
          <Card className="overflow-hidden mb-5 flex-1">
            <CardContent className="p-0">
              <div className="aspect-square relative">
                <img
                  src={currentImageUrl}
                  alt={product.name ?? "Product"}
                  className="w-full h-full object-cover"
                />
              </div>
            </CardContent>
          </Card>

          {hasMultipleImages && (
            <ImageCarousel
              images={productImages}
              onSelect={setSelectedImageIndex}
            />
          )}
        </div>

        <div className="space-y-6">
          <div className="text-sm">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href={`/categories/${product.category?.slug ?? ""}`}>
                      {product.category?.name ?? "Category"}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>

                {product.subcategory && (
                  <>
                    <BreadcrumbSeparator>
                      <Slash />
                    </BreadcrumbSeparator>
                    <BreadcrumbItem>
                      <BreadcrumbLink asChild>
                        <Link
                          href={`/categories/${
                            product.category?.slug ?? ""
                          }/subcategories/${product.subcategory.slug}`}
                        >
                          {product.subcategory.name}
                        </Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                  </>
                )}
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-2">
              {product.name ?? "Product"}
            </h2>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="w-4 h-4 fill-muted stroke-muted-foreground"
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">(0 reviews)</span>
            </div>
          </div>

          <div className="min-h-[5rem] space-y-3">
            <div className="flex items-center">
              {hasEnoughSelections && currentVariant ? (
                <div className="text-3xl font-bold">
                  {formatUSD(currentPrice)}
                </div>
              ) : (
                <div className="text-lg text-muted-foreground">
                  Please select all options to see price
                </div>
              )}
            </div>

            {hasEnoughSelections && currentVariant && (
              <div className="flex items-center gap-2">
                {currentStock > 0 ? (
                  <>
                    <Badge
                      variant="outline"
                      className="text-primary border-primary"
                    >
                      <Check className="w-3 h-3 mr-1" />
                      In Stock
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {currentStock} available
                    </span>
                  </>
                ) : (
                  <Badge
                    variant="outline"
                    className="text-destructive border-destructive"
                  >
                    Out of Stock
                  </Badge>
                )}
              </div>
            )}
          </div>

          <Separator />

          {product.description && (
            <div>
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          {productAttributes.length > 0 && (
            <div className="space-y-4">
              {productAttributes.map((attribute: ProductAttribute) => {
                const availableValues = getAvailableValues(
                  attribute.id,
                  selectedAttributes
                );
                const selectedValueId = selectedAttributes[attribute.id];
                const selectedValueLabel =
                  selectedValueId && attribute.values
                    ? attribute.values.find((v) => v.id === selectedValueId)
                        ?.value
                    : null;

                return (
                  <div key={attribute.id}>
                    <Label className="text-sm font-medium mb-2 block">
                      {attribute.name}
                      {selectedValueLabel && (
                        <span className="text-muted-foreground font-normal ml-2">
                          ({selectedValueLabel})
                        </span>
                      )}
                    </Label>
                    <div className="flex gap-2 flex-wrap">
                      {(attribute.values ?? []).map(
                        (value: ProductAttributeValue) => {
                          const isAvailable = availableValues.has(value.id);
                          const isSelected = selectedValueId === value.id;

                          return (
                            <Button
                              key={value.id}
                              variant={isSelected ? "default" : "outline"}
                              size="sm"
                              disabled={!isAvailable}
                              onClick={() =>
                                handleAttributeChange(attribute.id, value.id)
                              }
                              className="min-w-fit"
                            >
                              {value.value}
                            </Button>
                          );
                        }
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Label className="text-sm font-medium">Quantity:</Label>
              <div className="flex items-center border rounded-md">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleQuantityChange("decrement")}
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="px-4 py-2 text-center min-w-[3rem]">
                  {quantity}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleQuantityChange("increment")}
                  disabled={!currentVariant || quantity >= currentStock}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                size="lg"
                className="flex-1"
                disabled={!canAddToCart || addToCartIsPending}
                onClick={handleAddToCart}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {addToCartButtonText}
              </Button>
              <Button
                variant="outline"
                size="lg"
                disabled={wishlistIsPending}
                onClick={handleToggleWishlist}
                className={cn(
                  "relative group transition-all duration-300",
                  product.wishlist &&
                    "border-destructive hover:bg-destructive/80"
                )}
              >
                <Heart
                  className={cn(
                    "w-4 h-4 transition-transform duration-300",
                    product.wishlist
                      ? "fill-destructive text-destructive scale-110"
                      : "fill-transparent text-muted-foreground group-hover:scale-110 group-hover:text-destructive/60"
                  )}
                />
              </Button>
            </div>
          </div>

          <Separator />

          <div className="text-sm text-muted-foreground">
            Updated:{" "}
            {product.updated_at
              ? new Date(product.updated_at).toLocaleDateString()
              : "N/A"}
          </div>
        </div>
      </div>
    </div>
  );
};

export const ProductDetailSkeleton = () => {
  return (
    <div className="mb-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-4">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <Skeleton className="aspect-square rounded-lg w-full h-full" />
            </CardContent>
          </Card>
          <ImageCarousel isLoading />
        </div>

        <div className="space-y-6 h-full flex flex-col justify-between">
          <Skeleton className="flex-1" />

          <div className="flex gap-3">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-10" />
          </div>
        </div>
      </div>
    </div>
  );
};
