"use client"

"use client";

import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, ShoppingCart, Eye } from "lucide-react";
import { useGetAllProducts } from "../hooks/products/use-get-all-products";
import { Product } from "@/queries/client/products/types";

// Remove the mock data array

const ProductCard = ({ product }: { product: Product }) => {
  const mainImage = product.images[0]?.image_url || "/api/placeholder/300/300";
  const minPrice = Math.min(...product.variants.map(v => v.price));
  const maxPrice = Math.max(...product.variants.map(v => v.price));
  const totalStock = product.variants.reduce(
    (sum, v) => sum + v.stock_quantity,
    0
  );
  const rating = 4.5; // Mock rating

  return (
    <Card className="group h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="p-0">
        <div className="relative overflow-hidden">
          <img
            src={mainImage}
            alt={product.name}
            className="w-full h-48 sm:h-56 object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="text-xs">
              {product.category.name}
            </Badge>
          </div>
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex flex-col gap-2">
              <button className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow">
                <Eye className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow">
                <ShoppingCart className="w-4 h-4" />
              </button>
            </div>
          </div>
          {totalStock < 10 && (
            <div className="absolute bottom-3 left-3">
              <Badge variant="destructive" className="text-xs">
                Low Stock
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-4 flex-grow">
        <div className="space-y-2">
          <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          
          {product.description && (
            <p className="text-muted-foreground text-sm line-clamp-2">
              {product.description}
            </p>
          )}
          
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{rating}</span>
            </div>
            <span className="text-muted-foreground">
              ({product._count.reviews} reviews)
            </span>
          </div>
          
          {product.subcategory && (
            <Badge variant="outline" className="text-xs w-fit">
              {product.subcategory.name}
            </Badge>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <div className="w-full space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              {minPrice === maxPrice ? (
                <p className="text-xl font-bold">${minPrice}</p>
              ) : (
                <p className="text-xl font-bold">
                  ${minPrice} - ${maxPrice}
                </p>
              )}
              {product.variants.length > 1 && (
                <p className="text-xs text-muted-foreground">
                  {product.variants.length} variants
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">Stock: {totalStock}</p>
              <p className="text-xs text-muted-foreground">
                SKU: {product.variants[0]?.sku}
              </p>
            </div>
          </div>
          
          <button className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 transition-colors font-medium">
            Add to Cart
          </button>
        </div>
      </CardFooter>
    </Card>
  );
};

const ProductSkeleton = () => (
  <Card className="h-full overflow-hidden">
    <CardHeader className="p-0">
      <Skeleton className="w-full h-48 sm:h-56" />
    </CardHeader>
    <CardContent className="p-4 space-y-3">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex gap-2">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-5 w-20" />
    </CardContent>
    <CardFooter className="p-4 pt-0 space-y-3">
      <div className="w-full space-y-2">
        <div className="flex justify-between">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-4 w-12" />
        </div>
        <Skeleton className="h-10 w-full" />
      </div>
    </CardFooter>
  </Card>
);

export const ProductSection = () => {
  const { isFetching, products } = useGetAllProducts();

  if (isFetching) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <ProductSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Our Products</h2>
        <p className="text-muted-foreground">
          Discover our curated collection of premium products
        </p>
      </div>
      
      {products && products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="mb-4">
              <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground/50" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground">
              We couldn't find any products. Please try again later.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};