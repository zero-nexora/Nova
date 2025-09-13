"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ActionMenu } from "@/components/global/action-menu";
import { ArrowUpDown, Package } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { ProductTable } from "../hooks/types";

interface ProductTableColumnsProps {
  onUpdate: (product: ProductTable) => void;
  onDelete: (product: ProductTable) => void;
  onToggle: (product: ProductTable) => void;
}

export const createProductColumns = ({
  onUpdate,
  onDelete,
  onToggle
}: ProductTableColumnsProps): ColumnDef<ProductTable>[] => [
  {
    accessorKey: "images",
    header: "Image",
    cell: ({ row }) => {
      const images = row.getValue("images") as ProductTable["images"];
      const firstImage = images?.[0];
      return (
        <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100">
          {firstImage ? (
            <img
              src={firstImage.image_url}
              alt={row.original.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-6 w-6 text-gray-400" />
            </div>
          )}
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
        <div>
          <Badge variant="secondary" className="mb-1">
            {category.name}
          </Badge>
          {subcategory && (
            <Badge variant="outline" className="text-xs">
              {subcategory.name}
            </Badge>
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
        <div className="text-sm">
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
      >
        Created
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      return formatDate(row.getValue("created_at"));
    },
  },
  {
    accessorKey: "is_deleted",
    header: "Status",
    cell: ({ row }) => {
      const isDeleted = row.getValue("is_deleted") as boolean;
      return (
        <Badge variant={isDeleted ? "destructive" : "default"}>
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
        onUpdate={() => onUpdate(row.original)}
        onDelete={() => onDelete(row.original)}
        onToggle={() => onToggle(row.original)}
      />
    ),
    enableSorting: false,
  },
];
