"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Category } from "@/stores/admin/categories-store";
import { Calendar, Hash, Image as ImageIcon, Tag } from "lucide-react";

interface CategoryDetailCardProps {
  category: Category;
}

export const CategoryDetailCard = ({ category }: CategoryDetailCardProps) => {
  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(new Date(date));
  };

  return (
    <div className="overflow-hidden rounded-2xl shadow-lg border border-border bg-background hover:shadow-xl transition-shadow duration-300">
      {/* Header with Image */}
      <div className="relative">
        {category.image_url ? (
          <div className="relative w-full h-64">
            <Image
              src={category.image_url}
              alt={category.name}
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
          {category.is_deleted ? (
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
            {category.name}
          </h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Tag className="w-4 h-4" />
            <span>
              Slug: <b>{category.slug}</b>
            </span>
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-muted p-4 rounded-lg text-muted-foreground">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-blue-500" />
            <div>
              <span className="font-medium">Created:</span>{" "}
              <b>{formatDate(category.created_at)}</b>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-blue-500" />
            <div>
              <span className="font-medium">Updated:</span>{" "}
              <b>{formatDate(category.updated_at)}</b>
            </div>
          </div>
          {category.deleted_at && (
            <div className="flex items-center gap-3 md:col-span-2">
              <Calendar className="w-5 h-5 text-red-500" />
              <div>
                <span className="font-medium">Deleted:</span>{" "}
                <b>{formatDate(category.deleted_at)}</b>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3">
            <Hash className="w-5 h-5 text-purple-500" />
            <div>
              <span className="font-medium">Subcategories:</span>{" "}
              <b>{category.subcategories.length}</b>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
