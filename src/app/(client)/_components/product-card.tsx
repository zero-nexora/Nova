"use client";

import { Badge } from "@/components/ui/badge";
import { Product } from "@/queries/client/products/types";
import { placeholderImage } from "@/lib/constants";
import Image from "next/image";
import { Star } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatUSD } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const image = product.images[0]?.image_url || placeholderImage;
  const minPrice = Math.min(...product.variants.map((v) => v.price));
  const maxPrice = Math.max(...product.variants.map((v) => v.price));
  const stock = product.variants.reduce((sum, v) => sum + v.stock_quantity, 0);

  return (
    <Link href={`/products/${product.slug}`}>
      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col">
        <div className="relative h-52 overflow-hidden">
          <Image
            src={image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {stock < 10 && (
            <Badge
              variant="destructive"
              className="absolute top-3 right-3 text-xs"
            >
              Low Stock
            </Badge>
          )}
        </div>

        <div className="p-3 flex-1 flex flex-col justify-between space-y-3">
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className="text-xs">{product.category.name}</Badge>
              <Badge className="text-xs">{product.subcategory?.name}</Badge>
            </div>

            <h3 className="font-semibold text-lg line-clamp-2 leading-tight">
              {product.name}
            </h3>

            {product.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {product.description}
              </p>
            )}

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">4.5</span>
              </div>
              <span className="text-xs text-muted-foreground">
                ({product._count.reviews} reviews)
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-end justify-between">
              <div className="font-bold text-xl">
                {minPrice === maxPrice
                  ? formatUSD(minPrice)
                  : `${formatUSD(minPrice)} - ${formatUSD(maxPrice)}`}
              </div>
              <span className="text-sm text-muted-foreground">
                {stock} in stock
              </span>
            </div>

            <Button
              className="w-full bg-primary text-primary-foreground py-2.5 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors duration-200"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              Add to Cart
            </Button>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export const ProductSkeleton = () => (
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
