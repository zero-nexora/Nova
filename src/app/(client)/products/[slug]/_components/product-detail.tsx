"use client";

import React, { useState } from "react";
import { Heart, ShoppingCart, Star, Minus, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useGetProductBySlug } from "../hooks/use-get-product-by-slug";
import {
  Image,
  ProductAttribute,
  ProductAttributeValue,
  Variant,
  VariantAttribute,
} from "@/queries/client/products/types";
import { Label } from "@/components/ui/label";

interface ProductDetailProps {
  slug: string;
}

export const ProductDetail = ({ slug }: ProductDetailProps) => {
  const { product } = useGetProductBySlug(slug);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedAttributes, setSelectedAttributes] = useState<
    Record<string, string>
  >({});

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="space-y-4">
              <div className="aspect-square rounded-lg"></div>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-12 h-12 rounded-md"></div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-8 rounded w-3/4"></div>
              <div className="h-6 rounded w-1/2"></div>
              <div className="h-20 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleAttributeChange = (attributeId: string, valueId: string) => {
    setSelectedAttributes((prev) => ({
      ...prev,
      [attributeId]: valueId,
    }));
  };

  const currentVariant =
    product.variants.find((variant: Variant) =>
      variant.attributes.every((variantAttr: VariantAttribute) => {
        const selectedValue =
          selectedAttributes[variantAttr.attributeValue.attribute.id];
        return (
          !selectedValue || selectedValue === variantAttr.attributeValue.id
        );
      })
    ) || product.variants[0];

  const currentPrice = currentVariant ? currentVariant.price / 100 : 0;
  const currentStock = currentVariant ? currentVariant.stock_quantity : 0;

  const handleQuantityChange = (type: "increment" | "decrement") => {
    if (type === "increment" && quantity < currentStock) {
      setQuantity((prev) => prev + 1);
    } else if (type === "decrement" && quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left side - Images */}
        <div className="space-y-4">
          {/* Main Image */}
          <Card className="overflow-hidden">
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

          {/* Thumbnail Carousel - UI được cải thiện */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {product.images.map((image: Image, index: number) => (
                <div
                  key={image.id}
                  className={`relative flex-shrink-0 cursor-pointer transition-all duration-200 ease-in-out transform hover:scale-105 ${
                    selectedImageIndex === index
                      ? "ring-2 ring-primary ring-offset-2 scale-105"
                      : "hover:ring-2 hover:ring-gray-300 hover:ring-offset-1"
                  }`}
                  onMouseEnter={() => setSelectedImageIndex(index)}
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <div className="w-20 h-20 relative overflow-hidden rounded-lg bg-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <img
                      src={image.image_url}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-200 hover:scale-110"
                    />
                    {/* Overlay khi được chọn */}
                    {selectedImageIndex === index && (
                      <div className="absolute inset-0 bg-primary/10 rounded-lg" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right side - Product Info */}
        <div className="space-y-6">
          {/* Breadcrumb */}
          <div className="text-sm">
            <span>{product.category.name}</span>
            {product.subcategory && (
              <>
                <span className="mx-2">/</span>
                <span>{product.subcategory.name}</span>
              </>
            )}
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

          {/* Price */}
          <div className="text-3xl font-bold">${currentPrice.toFixed(2)}</div>

          {/* Stock Status */}
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

          <Separator />

          {product.description && (
            <div>
              <p className="leading-relaxed">{product.description}</p>
            </div>
          )}

          {/* Attributes Selection */}
          {product.attributes && product.attributes.length > 0 && (
            <div className="space-y-4">
              {product.attributes.map((attribute: ProductAttribute) => (
                <div key={attribute.id}>
                  <label className="text-sm font-medium mb-2 block">
                    {attribute.name}
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {attribute.values.map((value: ProductAttributeValue) => (
                      <Button
                        key={value.id}
                        variant={
                          selectedAttributes[attribute.id] === value.id
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        disabled={!value.available}
                        onClick={() =>
                          handleAttributeChange(attribute.id, value.id)
                        }
                        className="min-w-fit"
                      >
                        {value.value}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
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
                  disabled={quantity >= currentStock}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                size="lg"
                className="flex-1"
                disabled={currentStock === 0}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
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
