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

export const ProductDetail = ({ slug }: ProductDetailProps) => {
  const { addToCartAsync, isPending: addToCartIsPending } = useAddToCart();
  const { toggleWishlistAsync, isPending: wishlistIsPending } =
    useToggleWishlist();
  const { product, error } = useGetProductBySlug(slug);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedAttributes, setSelectedAttributes] =
    useState<SelectedAttributes>({});

  const findMatchingVariant = (
    selections: SelectedAttributes
  ): Variant | undefined => {
    return product.variants.find((variant) => {
      const variantAttributeMap = new Map(
        variant.attributes.map((attr) => [
          attr.attributeValue.attribute.id,
          attr.attributeValue.id,
        ])
      );

      for (const [attrId, valueId] of Object.entries(selections)) {
        if (variantAttributeMap.get(attrId) !== valueId) {
          return false;
        }
      }

      if (variant.attributes.length === 1) {
        const [variantAttrId, variantValueId] = Array.from(
          variantAttributeMap.entries()
        )[0];
        return selections[variantAttrId] === variantValueId;
      }

      if (variant.attributes.length !== Object.keys(selections).length) {
        return false;
      }

      return true;
    });
  };

  const getAvailableValues = (
    attributeId: string,
    tempSelections: SelectedAttributes
  ): Set<string> => {
    const availableValueIds = new Set<string>();

    const singleAttrVariant = product.variants.find(
      (v) =>
        v.attributes.length === 1 &&
        tempSelections[v.attributes[0].attributeValue.attribute.id] ===
          v.attributes[0].attributeValue.id
    );

    if (
      singleAttrVariant &&
      singleAttrVariant.attributes[0].attributeValue.attribute.id ===
        attributeId
    ) {
      availableValueIds.add(singleAttrVariant.attributes[0].attributeValue.id);
      return availableValueIds;
    }

    const matchingVariants = product.variants.filter((variant) => {
      const hasAttribute = variant.attributes.some(
        (attr) => attr.attributeValue.attribute.id === attributeId
      );
      if (!hasAttribute) return false;

      const matchesSelection = variant.attributes.every((variantAttr) => {
        const variantAttrId = variantAttr.attributeValue.attribute.id;
        if (variantAttrId === attributeId) return true;

        const selectedValue = tempSelections[variantAttrId];
        return (
          !selectedValue || selectedValue === variantAttr.attributeValue.id
        );
      });

      if (!matchesSelection) return false;

      const allSelectionsCovered = Object.keys(tempSelections).every(
        (selectedAttrId) =>
          selectedAttrId === attributeId ||
          variant.attributes.some(
            (attr) => attr.attributeValue.attribute.id === selectedAttrId
          )
      );

      return allSelectionsCovered;
    });

    matchingVariants.forEach((variant) => {
      variant.attributes.forEach((variantAttr) => {
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
  };

  const currentVariant = findMatchingVariant(selectedAttributes);
  const currentPrice = currentVariant ? currentVariant.price / 100 : 0;
  const currentStock = currentVariant ? currentVariant.stock_quantity : 0;

  const hasEnoughSelections = (): boolean => {
    if (!currentVariant) return false;

    const requiredAttrIds = new Set(
      currentVariant.attributes.map((attr) => attr.attributeValue.attribute.id)
    );

    if (currentVariant.attributes.length === 1) {
      return !!selectedAttributes[
        currentVariant.attributes[0].attributeValue.attribute.id
      ];
    }

    return Array.from(requiredAttrIds).every((id) => selectedAttributes[id]);
  };

  const allAttributesSelected = hasEnoughSelections();
  const canAddToCart =
    allAttributesSelected && currentVariant && currentStock > 0;

  const handleQuantityChange = (type: "increment" | "decrement") => {
    if (type === "increment" && currentVariant && quantity < currentStock) {
      setQuantity((prev) => prev + 1);
    } else if (type === "decrement" && quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleAddToCart = async () => {
    if (!currentVariant) return;
    await addToCartAsync({ productVariantId: currentVariant.id, quantity });
  };

  const handleToggleWishlist = async () => {
    await toggleWishlistAsync({ productId: product.id });
  };

  if (error) return <Error />;
  if (!product) return <NotFound />;

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-4">
          <Card className="overflow-hidden mb-5">
            <CardContent className="p-0">
              <div className="aspect-square relative">
                <img
                  src={
                    product.images?.[selectedImageIndex]?.image_url ||
                    placeholderImage
                  }
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </CardContent>
          </Card>

          {product.images && product.images.length > 1 && (
            <ImageCarousel
              images={product.images}
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

          <div>
            <h2 className="text-3xl font-bold mb-2">{product.name}</h2>
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

          {/* DESCRIPTION */}
          {product.description && (
            <div>
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          {/* ATTRIBUTES */}
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

          {/* QUANTITY & ACTIONS */}
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
                {!allAttributesSelected
                  ? "Select Options"
                  : currentStock === 0
                  ? "Out of Stock"
                  : "Add to Cart"}
              </Button>
              <Button
                variant="outline"
                size="lg"
                disabled={wishlistIsPending}
                onClick={handleToggleWishlist}
                className={cn(
                  "relative group transition-all duration-300 ",
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

          {/* METADATA */}
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
