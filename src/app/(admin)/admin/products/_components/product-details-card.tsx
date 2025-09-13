"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Hash,
  Image as ImageIcon,
  Tag,
  Package,
  Layers,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { ProductTable } from "../hooks/types";

interface ProductDetailCardProps {
  product: ProductTable;
}

export const ProductDetailCard = ({ product }: ProductDetailCardProps) => {
  const mainImage = product.images[0]?.image_url;

  return (
    <div className="overflow-hidden rounded-2xl shadow-lg border border-border bg-background hover:shadow-xl transition-shadow duration-300">
      {/* Header with Image */}
      <div className="relative">
        {mainImage ? (
          <div className="relative w-full h-64">
            <Image
              src={mainImage}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 hover:scale-105"
              sizes="(max-width: 768px) 100vw, 600px"
              priority
            />
          </div>
        ) : (
          <div className="w-full h-64 flex items-center justify-center bg-muted">
            <ImageIcon className="w-16 h-16 text-muted-foreground" />
          </div>
        )}
        <div className="absolute top-4 left-4">
          {product.is_deleted ? (
            <Badge
              variant="destructive"
              className="px-3 py-1 text-sm font-medium"
            >
              Deleted
            </Badge>
          ) : (
            <Badge className="px-3 py-1 text-sm font-medium bg-green-500 hover:bg-green-600 text-white">
              Active
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Title and Slug */}
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            {product.name}
          </h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Tag className="w-4 h-4" />
            <span>
              Slug: <b>{product.slug}</b>
            </span>
          </div>
          {product.description && (
            <p className="text-muted-foreground text-sm mt-2">
              {product.description}
            </p>
          )}
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-muted p-4 rounded-lg text-muted-foreground">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-blue-500" />
            <div>
              <span className="font-medium">Created:</span>{" "}
              <b>{formatDate(product.created_at)}</b>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-blue-500" />
            <div>
              <span className="font-medium">Updated:</span>{" "}
              <b>{formatDate(product.updated_at)}</b>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Layers className="w-5 h-5 text-purple-500" />
            <div>
              <span className="font-medium">Category:</span>{" "}
              <b>{product.category?.name}</b>
              {product.subcategory && (
                <>
                  {" "}
                  / <b>{product.subcategory.name}</b>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Hash className="w-5 h-5 text-orange-500" />
            <div>
              <span className="font-medium">Variants:</span>{" "}
              <b>{product._count?.variants ?? product.variants.length}</b>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Package className="w-5 h-5 text-teal-500" />
            <div>
              <span className="font-medium">Reviews:</span>{" "}
              <b>{product._count?.reviews ?? 0}</b>
            </div>
          </div>
        </div>

        {/* Variants List */}
        {product.variants.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">Variants</h3>
            <div className="space-y-2">
              {product.variants.map((variant) => (
                <div
                  key={variant.id}
                  className="flex justify-between items-center p-3 border rounded-lg bg-card hover:shadow-sm"
                >
                  <span className="font-medium">{variant.sku}</span>
                  <div className="flex gap-6 text-sm text-muted-foreground">
                    <span>
                      Price: <b>${variant.price}</b>
                    </span>
                    <span>
                      Stock: <b>{variant.stock_quantity}</b>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
