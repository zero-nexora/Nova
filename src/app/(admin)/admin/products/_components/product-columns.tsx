"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ActionMenu } from "@/components/global/action-menu";
import { ArrowUpDown } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { ProductTable } from "../hooks/types";
import { Product } from "@/queries/admin/products/types";
import Image from "next/image";
import { placeholderImage } from "@/lib/constants";

interface ProductTableColumnsProps {
  onUpdate?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  onToggle?: (product: Product) => void;
  onView?: (product: Product) => void;
}

export const createProductColumns = ({
  onUpdate,
  onDelete,
  onToggle,
  onView,
}: ProductTableColumnsProps): ColumnDef<Product>[] => [
  // Checkbox column
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
  {
    accessorKey: "images",
    header: "Image",
    cell: ({ row }) => {
      const images = row.getValue("images") as ProductTable["images"];
      const firstImage = images?.[0]?.image_url || placeholderImage;
      return (
        <div className="relative w-12 h-12 rounded-md overflow-hidden bg-gray-100">
          <Image
            src={firstImage}
            alt={row.original.name}
            className="object-cover"
            fill
          />
        </div>
      );
    },
    enableSorting: false,
  },
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
    cell: ({ row }) => (
      <div className="max-w-[200px]">
        <div className="font-medium truncate">{row.getValue("name")}</div>
        <div className="text-sm text-muted-foreground truncate">
          {row.original.description}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      const category = row.getValue("category") as ProductTable["category"];
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
  {
    accessorKey: "variants",
    header: "Variants",
    cell: ({ row }) => {
      const variants = row.getValue("variants") as ProductTable["variants"];
      const minPrice = Math.min(...variants.map((v) => v.price));
      const maxPrice = Math.max(...variants.map((v) => v.price));
      const totalStock = variants.reduce((sum, v) => sum + v.stock_quantity, 0);

      return (
        <div className="text-sm space-y-1">
          <div className="font-medium">{variants.length} variant(s)</div>
          <div className="text-muted-foreground">
            $
            {minPrice === maxPrice
              ? minPrice.toFixed(2)
              : `${minPrice.toFixed(2)} - ${maxPrice.toFixed(2)}`}
          </div>
          <div className="text-muted-foreground">Stock: {totalStock}</div>
        </div>
      );
    },
  },
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
      return (
        <span className="text-sm">
          {formatDate(row.getValue("created_at"))}
        </span>
      );
    },
  },
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
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <ActionMenu
        onUpdate={() => onUpdate?.(row.original)}
        onDelete={() => onDelete?.(row.original)}
        onToggle={() => onToggle?.(row.original)}
        onView={() => onView?.(row.original)}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
];
