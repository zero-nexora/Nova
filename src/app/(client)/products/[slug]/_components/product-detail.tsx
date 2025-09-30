"use client";

import React, { useState } from "react";
import {
  Heart,
  ShoppingCart,
  Star,
  Minus,
  Plus,
  Check,
  SlashIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useGetProductBySlug } from "../hooks/use-get-product-by-slug";
import {
  Image as ImageType,
  ProductAttribute,
  ProductAttributeValue,
  Variant,
  VariantAttribute,
} from "@/queries/client/products/types";
import { Label } from "@/components/ui/label";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { formatUSD } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";

interface ProductDetailProps {
  slug: string;
}

export const ProductDetail = ({ slug }: ProductDetailProps) => {
  const { product, isPending, error } = useGetProductBySlug(slug);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedAttributes, setSelectedAttributes] = useState<
    Record<string, string>
  >({});

  if (isPending) {
    return <ProductDetailSkeleton />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-red-500">Error: {error.message}</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div>Product not found</div>
      </div>
    );
  }

  const handleAttributeChange = (attributeId: string, valueId: string) => {
    setSelectedAttributes((prev) => {
      // Nếu click vào value đang được chọn, thì bỏ chọn
      if (prev[attributeId] === valueId) {
        const newAttributes = { ...prev };
        delete newAttributes[attributeId];
        return newAttributes;
      }

      // Nếu không, chọn value mới
      return {
        ...prev,
        [attributeId]: valueId,
      };
    });
  };

  // Lấy danh sách các attribute values có thể chọn dựa trên selections hiện tại
  const getAvailableValues = (attributeId: string): Set<string> => {
    const availableValueIds = new Set<string>();

    // Lọc các variants phù hợp với các attributes đã chọn (ngoại trừ attribute hiện tại)
    const matchingVariants = product.variants.filter((variant: Variant) =>
      variant.attributes.every((variantAttr: VariantAttribute) => {
        const attrId = variantAttr.attributeValue.attribute.id;

        // Bỏ qua attribute hiện tại đang xét
        if (attrId === attributeId) return true;

        // Kiểm tra các attributes khác đã được chọn
        const selectedValue = selectedAttributes[attrId];
        return (
          !selectedValue || selectedValue === variantAttr.attributeValue.id
        );
      })
    );

    // Thu thập tất cả values có thể chọn từ các variants phù hợp
    matchingVariants.forEach((variant: Variant) => {
      variant.attributes.forEach((variantAttr: VariantAttribute) => {
        if (variantAttr.attributeValue.attribute.id === attributeId) {
          availableValueIds.add(variantAttr.attributeValue.id);
        }
      });
    });

    return availableValueIds;
  };

  // Kiểm tra xem đã chọn đủ tất cả attributes chưa
  const allAttributesSelected =
    product.attributes &&
    product.attributes.length > 0 &&
    product.attributes.every(
      (attr: ProductAttribute) => selectedAttributes[attr.id]
    );

  // Tìm variant phù hợp với các attributes đã chọn
  const currentVariant = allAttributesSelected
    ? product.variants.find((variant: Variant) =>
        variant.attributes.every((variantAttr: VariantAttribute) => {
          const selectedValue =
            selectedAttributes[variantAttr.attributeValue.attribute.id];
          return selectedValue === variantAttr.attributeValue.id;
        })
      )
    : null;

  const currentPrice = currentVariant ? currentVariant.price / 100 : 0;
  const currentStock = currentVariant ? currentVariant.stock_quantity : 0;

  const handleQuantityChange = (type: "increment" | "decrement") => {
    if (type === "increment" && quantity < currentStock) {
      setQuantity((prev) => prev + 1);
    } else if (type === "decrement" && quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

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
                  <div className="w-full h-full flex items-center justify-center">
                    No Image Available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Thumbnail Carousel - Using shadcn/ui Carousel */}
          {product.images && product.images.length > 1 && (
            <Carousel
              className="w-full max-w-md mx-auto"
              opts={{
                align: "start",
                loop: true,
              }}
            >
              <CarouselContent className="grid grid-cols-4 sm:grid-cols-5 gap-4">
                {product.images
                  .slice(0, 10)
                  .map((image: ImageType, index: number) => (
                    <CarouselItem
                      key={image.id}
                      className="basis-1/4 sm:basis-1/5 md:basis-1/6"
                    >
                      <div
                        className={`relative flex-shrink-0 cursor-pointer transition-all duration-200 ${
                          selectedImageIndex === index
                            ? "scale-105"
                            : "hover:scale-102"
                        }`}
                        onMouseEnter={() => setSelectedImageIndex(index)}
                      >
                        <div className="w-20 h-20 relative overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                          <Image
                            src={image.image_url}
                            fill
                            alt={`${product.name} ${index + 1}`}
                          />
                          {selectedImageIndex === index && (
                            <div className="absolute inset-0 bg-primary/10 rounded-lg" />
                          )}
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          )}
        </div>

        {/* Right side - Product Info */}
        <div className="space-y-6">
          {/* Breadcrumb */}
          <div className="text-sm">
            <Breadcrumb>
              <BreadcrumbList>
                {/* Home */}
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/">Home</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>

                <BreadcrumbSeparator>
                  <SlashIcon />
                </BreadcrumbSeparator>

                {/* Category */}
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href={`/category/${product.category.slug}`}>
                      {product.category.name}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>

                {product.subcategory && (
                  <>
                    <BreadcrumbSeparator>
                      <SlashIcon />
                    </BreadcrumbSeparator>

                    {/* Subcategory */}
                    <BreadcrumbItem>
                      <BreadcrumbLink asChild>
                        <Link
                          href={`/category/${product.category.slug}/${product.subcategory.slug}`}
                        >
                          {product.subcategory.name}
                        </Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                  </>
                )}

                <BreadcrumbSeparator>
                  <SlashIcon />
                </BreadcrumbSeparator>

                {/* Current Product */}
                <BreadcrumbItem>
                  <BreadcrumbPage>{product.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Product Title */}
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>

            {/* Rating placeholder */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-4 h-4" />
                ))}
              </div>
              <span className="text-sm">(0 reviews)</span>
            </div>
          </div>

          {/* Price & Stock Status - fixed height để tránh nhảy layout */}
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

            {/* Stock Status - chỉ hiển thị khi đã chọn variant */}
            {allAttributesSelected && currentVariant && (
              <div className="flex items-center gap-2">
                {currentStock > 0 ? (
                  <>
                    <Badge variant="outline">
                      <Check className="w-3 h-3 mr-1" />
                      In Stock
                    </Badge>
                    <span className="text-sm">{currentStock} available</span>
                  </>
                ) : (
                  <Badge variant="outline">Out of Stock</Badge>
                )}
              </div>
            )}
          </div>

          <Separator />

          {product.description && (
            <div>
              <p className="leading-relaxed">{product.description}</p>
            </div>
          )}

          {/* Attributes Selection */}
          {product.attributes && product.attributes.length > 0 && (
            <div className="space-y-4">
              {product.attributes.map((attribute: ProductAttribute) => {
                const availableValues = getAvailableValues(attribute.id);

                return (
                  <div key={attribute.id}>
                    <Label className="text-sm font-medium mb-2 block">
                      {attribute.name}
                    </Label>
                    <div className="flex gap-2 flex-wrap">
                      {attribute.values.map((value: ProductAttributeValue) => {
                        const isAvailable = availableValues.has(value.id);
                        const isSelected =
                          selectedAttributes[attribute.id] === value.id;

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
                  disabled={!canAddToCart || quantity <= 1}
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
                  disabled={!canAddToCart || quantity >= currentStock}
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
                  : currentStock === 0
                  ? "Out of Stock"
                  : "Add to Cart"}
              </Button>
              <Button variant="outline" size="lg">
                <Heart className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Product Meta */}
          <Separator />
          <div className="text-sm">
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
          {/* Main Image */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <Skeleton className="aspect-square rounded-lg w-full h-full" />
            </CardContent>
          </Card>
          {/* Thumbnail Carousel placeholders */}
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton
                key={i}
                className="w-20 h-20 rounded-lg flex-shrink-0"
              />
            ))}
          </div>
        </div>

        {/* Right side - Product Info */}
        <div className="space-y-6">
          {/* Breadcrumb */}
          <Skeleton className="h-4 w-1/2" />

          {/* Product Title */}
          <div>
            <Skeleton className="h-9 w-3/4 mb-2" />
            {/* Rating placeholder */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Skeleton key={star} className="w-4 h-4" />
                ))}
              </div>
              <Skeleton className="h-4 w-20" />
            </div>
          </div>

          {/* Price */}
          <Skeleton className="h-9 w-1/4" />

          {/* Stock Status */}
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              <Skeleton className="w-3 h-3 mr-1" />
              <Skeleton className="h-4 w-16" />
            </Badge>
            <Skeleton className="h-4 w-24" />
          </div>

          <Separator />

          {/* Description */}
          <div>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </div>

          {/* Attributes Selection */}
          <div className="space-y-4">
            {/* Simulate 2 attributes */}
            {[1, 2].map((attr) => (
              <div key={attr}>
                <Label>
                  <Skeleton className="h-4 w-20 mb-2 block" />
                </Label>
                <div className="flex gap-2 flex-wrap">
                  <Skeleton className="h-10 w-56" />
                </div>
              </div>
            ))}
          </div>

          <Separator />

          {/* Quantity and Add to Cart */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Label>
                <Skeleton className="h-4 w-20" />
              </Label>
              <div className="flex items-center border rounded-md">
                <Skeleton className="px-4 py-2 text-center min-w-[10rem] h-8" />
              </div>
            </div>

            <div className="flex gap-3">
              <Skeleton className="h-10 w-full" />
              <Button variant="outline" size="lg" disabled>
                <Skeleton className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Product Meta */}
          <Separator />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>
    </div>
  );
};
