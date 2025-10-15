"use client";

import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ActionMenu } from "@/components/global/action-menu";
import { formatDate, formatUSD } from "@/lib/utils";
import { placeholderImage } from "@/lib/constants";
import { ProductResponse } from "@/queries/admin/products/types";

interface ProductColumnHandlers {
  onUpdate?: (product: ProductResponse) => void;
  onDelete?: (product: ProductResponse) => void;
  onToggle?: (product: ProductResponse) => void;
  onView?: (product: ProductResponse) => void;
}

export const createProductColumns = ({
  onUpdate,
  onDelete,
  onToggle,
  onView,
}: ProductColumnHandlers): ColumnDef<ProductResponse>[] => [
  // Selection Column
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all rows"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label={`Select row ${row.index + 1}`}
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },

  // Image Column
  {
    accessorKey: "images",
    header: "Image",
    cell: ({ row }) => {
      const images = row.getValue("images") as ProductResponse["images"];
      const firstImage = images?.[0]?.image_url || placeholderImage;
      const productName = row.original.name;

      return (
        <div className="relative w-12 h-12 rounded-md overflow-hidden bg-gray-100">
          <Image
            src={firstImage}
            alt={productName}
            className="object-cover"
            fill
            sizes="48px"
          />
        </div>
      );
    },
    enableSorting: false,
  },

  // Name Column
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-8 px-2 lg:px-3"
      >
        Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      const description = row.original.description;

      return (
        <div className="max-w-[200px]">
          <div className="font-medium truncate">{name}</div>
          {description && (
            <div className="text-sm text-muted-foreground truncate">
              {description}
            </div>
          )}
        </div>
      );
    },
  },

  // Category Column
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      const category = row.getValue("category") as ProductResponse["category"];
      const subcategory = row.original.subcategory;

      return (
        <div className="space-y-1">
          <Badge variant="secondary" className="text-xs">
            {category.name}
          </Badge>
          {subcategory && (
            <div>
              <Badge variant="outline" className="text-xs">
                {subcategory.name}
              </Badge>
            </div>
          )}
        </div>
      );
    },
  },

  // Variants Column
  {
    accessorKey: "variants",
    header: "Variants",
    cell: ({ row }) => {
      const variants = row.getValue("variants") as ProductResponse["variants"];

      if (!variants || variants.length === 0) {
        return (
          <span className="text-sm text-muted-foreground">No variants</span>
        );
      }

      const prices = variants.map((v) => v.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const totalStock = variants.reduce((sum, v) => sum + v.stock_quantity, 0);

      return (
        <div className="text-sm space-y-1">
          <div className="font-medium">{variants.length} variant(s)</div>
          <div className="text-muted-foreground">
            {minPrice === maxPrice
              ? formatUSD(minPrice)
              : `${formatUSD(minPrice)} - ${formatUSD(maxPrice)}`}
          </div>
          <div className="text-muted-foreground">Stock: {totalStock}</div>
        </div>
      );
    },
  },

  // Created Date Column
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-8 px-2 lg:px-3"
      >
        Created
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const createdAt = row.getValue("created_at") as Date;
      return <span className="text-sm">{formatDate(createdAt)}</span>;
    },
  },

  // Status Column
  {
    accessorKey: "is_deleted",
    header: "Status",
    cell: ({ row }) => {
      const isDeleted = row.getValue("is_deleted") as boolean;
      return (
        <Badge
          variant={isDeleted ? "destructive" : "default"}
          className="text-xs"
        >
          {isDeleted ? "Deleted" : "Active"}
        </Badge>
      );
    },
  },

  // Actions Column
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const product = row.original;

      return (
        <ActionMenu
          onUpdate={() => onUpdate?.(product)}
          onDelete={() => onDelete?.(product)}
          onToggle={() => onToggle?.(product)}
          onView={() => onView?.(product)}
        />
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
];
