"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Product } from "@/queries/client/products/types";
import { placeholderImage } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Star } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const mainImage = product.images[0]?.image_url || placeholderImage;
  const minPrice = Math.min(...product.variants.map((v) => v.price));
  const maxPrice = Math.max(...product.variants.map((v) => v.price));
  const totalStock = product.variants.reduce(
    (sum, v) => sum + v.stock_quantity,
    0
  );
  const rating = 4.5;

  return (
    <Card className="group h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="p-0">
        <div className="relative overflow-hidden w-full h-48 sm:h-56 ">
          <Image
            src={mainImage}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="text-xs">
              {product.category.name}
            </Badge>
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

          {product.subcategory?.name && (
            <Badge variant="outline" className="text-xs w-fit">
              {product.subcategory?.name}
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
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {totalStock} in stock
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
