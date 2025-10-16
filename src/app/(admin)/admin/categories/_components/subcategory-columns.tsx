import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Subcategory } from "@/queries/admin/categories/types";
import { ActionMenu } from "@/components/global/action-menu";

interface SubcategoryColumnProps {
  onUpdateSubcategory: (subcategory: Subcategory) => void;
  onDeleteSubcategory: (subcategory: Subcategory) => void;
  onToggleSubcategory: (subcategory: Subcategory) => void;
  onViewSubcategory: (subcategory: Subcategory) => void;
}

export const SubcategoryColumns = ({
  onUpdateSubcategory,
  onDeleteSubcategory,
  onToggleSubcategory,
  onViewSubcategory,
}: SubcategoryColumnProps): ColumnDef<Subcategory>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    id: "name",
    header: ({ column }) => (
      <div
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex gap-2"
      >
        Subcategory Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </div>
    ),
    cell: ({ row }) => <div>{row.getValue("name")}</div>,
  },
  {
    accessorKey: "category.name",
    id: "category_name",
    header: () => <div>Category Name</div>,
    cell: ({ row }) => <div>{row.original.category?.name || "Unknown"}</div>,
  },
  {
    accessorKey: "slug",
    id: "slug",
    header: () => <div>Slug</div>,
    cell: ({ row }) => <div>{row.getValue("slug")}</div>,
  },
  {
    accessorKey: "is_deleted",
    id: "is_deleted",
    header: () => <div>Status</div>,
    cell: ({ row }) => (
      <Badge variant={row.getValue("is_deleted") ? "destructive" : "default"}>
        {row.getValue("is_deleted") ? "Deleted" : "Active"}
      </Badge>
    ),
    filterFn: (row, id, value) => {
      return value === "all" || row.getValue(id) === (value === "true");
    },
  },
  {
    accessorKey: "created_at",
    id: "created_at",
    header: ({ column }) => (
      <div
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex gap-2 items-center"
      >
        Created At
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </div>
    ),
    cell: ({ row }) => (
      <div>{new Date(row.getValue("created_at")).toLocaleDateString()}</div>
    ),
  },
  {
    accessorKey: "updated_at",
    id: "updated_at",
    header: ({ column }) => (
      <div
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex gap-2"
      >
        Updated At
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </div>
    ),
    cell: ({ row }) => (
      <div>{new Date(row.getValue("updated_at")).toLocaleDateString()}</div>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    header: () => <div>Actions</div>,
    cell: ({ row }) => (
      <ActionMenu
        onUpdate={() => onUpdateSubcategory(row.original)}
        onDelete={() => onDeleteSubcategory(row.original)}
        onToggle={() => onToggleSubcategory(row.original)}
        onView={() => onViewSubcategory(row.original)}
      />
    ),
  },
];
