"use client";

import React, { useState } from "react";
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
  VariantAttribute,
} from "@/queries/client/products/types";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { formatUSD } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import { ImageCarousel } from "./image-carousel";
import { ErrorDisplay } from "@/components/global/error-display";
import { NotFoundDisplay } from "@/components/global/not-found-display";

interface ProductDetailProps {
  slug: string;
}

export const ProductDetail = ({ slug }: ProductDetailProps) => {
  const { product, isPending, error, refetch } = useGetProductBySlug(slug);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedAttributes, setSelectedAttributes] = useState<
    Record<string, string>
  >({});

  if (isPending) {
    return <ProductDetailSkeleton />;
  }

  if (error)
    return (
      <ErrorDisplay errorMessage={error?.message || ""} onRetry={refetch} />
    );

  if (!product) return <NotFoundDisplay />;

  const findMatchingVariant = (
    selections: Record<string, string>
  ): Variant | undefined => {
    return product.variants.find((variant: Variant) => {
      const variantAttributeIds = new Set(
        variant.attributes.map((attr) => attr.attributeValue.attribute.id)
      );

      const allSelectionsCovered = Object.keys(selections).every((key) =>
        variantAttributeIds.has(key)
      );
      if (!allSelectionsCovered) return false;

      const relevantSelections = Object.entries(selections).filter(([attrId]) =>
        variantAttributeIds.has(attrId)
      );

      if (variant.attributes.length === 1) {
        const variantAttr = variant.attributes[0];
        return relevantSelections.some(
          ([attrId, valueId]) =>
            attrId === variantAttr.attributeValue.attribute.id &&
            valueId === variantAttr.attributeValue.id
        );
      }

      if (relevantSelections.length !== variantAttributeIds.size) {
        return false;
      }

      return relevantSelections.every(([attrId, valueId]) => {
        return variant.attributes.some(
          (variantAttr) =>
            variantAttr.attributeValue.attribute.id === attrId &&
            variantAttr.attributeValue.id === valueId
        );
      });
    });
  };

  const getAvailableValues = (
    attributeId: string,
    tempSelections: Record<string, string>
  ): Set<string> => {
    const availableValueIds = new Set<string>();

    const selectedSingleAttrVariant = product.variants.find(
      (variant: Variant) =>
        variant.attributes.length === 1 &&
        tempSelections[variant.attributes[0].attributeValue.attribute.id] ===
          variant.attributes[0].attributeValue.id
    );

    if (selectedSingleAttrVariant) {
      const variantAttr = selectedSingleAttrVariant.attributes[0];
      if (variantAttr.attributeValue.attribute.id === attributeId) {
        availableValueIds.add(variantAttr.attributeValue.id);
        return availableValueIds;
      }
      return availableValueIds;
    }

    const matchingVariants = product.variants.filter((variant: Variant) => {
      const hasThisAttribute = variant.attributes.some(
        (attr) => attr.attributeValue.attribute.id === attributeId
      );
      if (!hasThisAttribute) return false;

      const matchesSelections = variant.attributes.every(
        (variantAttr: VariantAttribute) => {
          const attrId = variantAttr.attributeValue.attribute.id;
          if (attrId === attributeId) return true;

          const selectedValue = tempSelections[attrId];
          return (
            !selectedValue || selectedValue === variantAttr.attributeValue.id
          );
        }
      );

      const allSelectedAttrsCovered = Object.keys(tempSelections).every(
        (key) => {
          if (key === attributeId) return true;
          return variant.attributes.some(
            (attr) => attr.attributeValue.attribute.id === key
          );
        }
      );

      return matchesSelections && allSelectedAttrsCovered;
    });

    matchingVariants.forEach((variant: Variant) => {
      variant.attributes.forEach((variantAttr: VariantAttribute) => {
        if (variantAttr.attributeValue.attribute.id === attributeId) {
          availableValueIds.add(variantAttr.attributeValue.id);
        }
      });
    });

    return availableValueIds;
  };

  const handleAttributeChange = (attributeId: string, valueId: string) => {
    setSelectedAttributes((prev) => {
      if (prev[attributeId] === valueId) {
        const newAttributes = { ...prev };
        delete newAttributes[attributeId];
        return newAttributes;
      }

      const newAttributes = {
        ...prev,
        [attributeId]: valueId,
      };

      Object.keys(newAttributes).forEach((attrId) => {
        if (attrId !== attributeId) {
          const availableValues = getAvailableValues(attrId, newAttributes);
          if (!availableValues.has(newAttributes[attrId])) {
            delete newAttributes[attrId];
          }
        }
      });

      return newAttributes;
    });
  };

  const handleQuantityChange = (type: "increment" | "decrement") => {
    if (type === "increment" && currentVariant && quantity < currentStock) {
      setQuantity((prev) => prev + 1);
    } else if (type === "decrement" && quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const currentVariant = findMatchingVariant(selectedAttributes);

  const hasEnoughSelections = (): boolean => {
    if (!currentVariant) return false;

    const requiredAttributeIds = new Set(
      currentVariant.attributes.map((attr) => attr.attributeValue.attribute.id)
    );

    if (currentVariant.attributes.length === 1) {
      return !!selectedAttributes[
        currentVariant.attributes[0].attributeValue.attribute.id
      ];
    }

    return Array.from(requiredAttributeIds).every(
      (attrId) => selectedAttributes[attrId]
    );
  };

  const allAttributesSelected = hasEnoughSelections();

  const currentPrice = currentVariant ? currentVariant.price / 100 : 0;
  const currentStock = currentVariant ? currentVariant.stock_quantity : 0;
  const canAddToCart =
    allAttributesSelected && currentVariant && currentStock > 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left side - Images */}
        <div className="space-y-4">
          {/* Main Image */}
          <Card className="overflow-hidden mb-5">
            <CardContent className="p-0">
              <div className="aspect-square relative">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[selectedImageIndex]?.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    No Image Available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Thumbnail Carousel */}
          {product.images && product.images.length > 1 && (
            <ImageCarousel
              images={product.images}
              onSelect={setSelectedImageIndex}
            />
          )}
        </div>

        {/* Right side - Product Info */}
        <div className="space-y-6">
          {/* Breadcrumb */}
          <div className="text-sm">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href={`/categories/${product.category.slug}`}>
                      {product.category.name}
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
                          href={`/categories/${product.category.slug}/subcategories/${product.subcategory.slug}`}
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

          {/* Product Title */}
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>

            {/* Rating */}
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

          {/* Price & Stock Status */}
          <div className="min-h-[5rem] space-y-3">
            <div className="flex items-center">
              {allAttributesSelected && currentVariant ? (
                <div className="text-3xl font-bold">
                  {formatUSD(currentPrice)}
                </div>
              ) : (
                <div className="text-lg text-muted-foreground">
                  Please select all options to see price
                </div>
              )}
            </div>

            {allAttributesSelected && currentVariant && (
              <div className="flex items-center gap-2">
                {currentStock > 0 ? (
                  <>
                    <Badge
                      variant="outline"
                      className="text-green-600 border-green-600"
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
                    className="text-red-600 border-red-red"
                  >
                    Out of Stock
                  </Badge>
                )}
              </div>
            )}
          </div>

          <Separator />

          {/* Description */}
          {product.description && (
            <div>
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          {/* Attributes Selection */}
          {product.attributes && product.attributes.length > 0 && (
            <div className="space-y-4">
              {product.attributes.map((attribute: ProductAttribute) => {
                const availableValues = getAvailableValues(
                  attribute.id,
                  selectedAttributes
                );
                const selectedValue = selectedAttributes[attribute.id];
                const selectedLabel = selectedValue
                  ? attribute.values.find((v) => v.id === selectedValue)?.value
                  : null;

                return (
                  <div key={attribute.id}>
                    <Label className="text-sm font-medium mb-2 block">
                      {attribute.name}
                      {selectedLabel && (
                        <span className="text-muted-foreground font-normal ml-2">
                          ({selectedLabel})
                        </span>
                      )}
                    </Label>
                    <div className="flex gap-2 flex-wrap">
                      {attribute.values.map((value: ProductAttributeValue) => {
                        const isAvailable = availableValues.has(value.id);
                        const isSelected = selectedValue === value.id;

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
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <Separator />

          {/* Quantity and Add to Cart */}
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
              <Button size="lg" className="flex-1" disabled={!canAddToCart}>
                <ShoppingCart className="w-4 h-4 mr-2" />
                {!allAttributesSelected
                  ? "Select Options"
                  : currentVariant
                  ? currentStock === 0
                    ? "Out of Stock"
                    : "Add to Cart"
                  : "Invalid Selection"}
              </Button>
              <Button variant="outline" size="lg">
                <Heart className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Product Meta */}
          <Separator />
          <div className="text-sm text-muted-foreground">
            Updated: {new Date(product.updated_at).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export const ProductDetailSkeleton = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left side - Images */}
        <div className="space-y-4">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <Skeleton className="aspect-square rounded-lg w-full h-full" />
            </CardContent>
          </Card>
          <ImageCarousel isLoading />
        </div>

        {/* Right side - Product Info */}
        <div className="space-y-6">
          <Skeleton className="h-4 w-1/2" />

          <div>
            <Skeleton className="h-9 w-3/4 mb-2" />
            <div className="flex items-center gap-2 mb-4">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Skeleton key={star} className="w-4 h-4" />
                ))}
              </div>
              <Skeleton className="h-4 w-20" />
            </div>
          </div>

          <div className="min-h-[5rem] space-y-3">
            <Skeleton className="h-9 w-1/4" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>

          <Separator />

          <div>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </div>

          <div className="space-y-4">
            {[1, 2].map((attr) => (
              <div key={attr}>
                <Skeleton className="h-4 w-20 mb-2" />
                <div className="flex gap-2 flex-wrap">
                  {[1, 2, 3, 4].map((val) => (
                    <Skeleton key={val} className="h-9 w-20" />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-32" />
            </div>

            <div className="flex gap-3">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-10" />
            </div>
          </div>

          <Separator />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>
    </div>
  );
};
