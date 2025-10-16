import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Category } from "@/queries/admin/categories/types";
import { ActionMenu } from "@/components/global/action-menu";

interface CategoryColumnProps {
  onUpdateCategory: (category: Category) => void;
  onDeleteCategory: (category: Category) => void;
  onToggleCategory: (category: Category) => void;
  onViewCategory: (category: Category) => void;
}

export const CategoryColumns = ({
  onUpdateCategory,
  onDeleteCategory,
  onToggleCategory,
  onViewCategory,
}: CategoryColumnProps): ColumnDef<Category>[] => [
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
    header: ({ column }) => (
      <div
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex gap-2"
      >
        Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </div>
    ),
    cell: ({ row }) => <div>{row.getValue("name")}</div>,
  },
  {
    accessorKey: "slug",
    header: () => <div>Slug</div>,
    cell: ({ row }) => <div>{row.getValue("slug")}</div>,
  },
  {
    accessorKey: "subcategories",
    header: () => <div>Subcategories</div>,
    cell: ({ row }) => (
      <Badge variant="secondary">
        {row.original.subcategories?.length || 0}
      </Badge>
    ),
    enableSorting: true,
    sortingFn: (rowA, rowB) => {
      const countA = rowA.original.subcategories?.length || 0;
      const countB = rowB.original.subcategories?.length || 0;
      return countA - countB;
    },
  },
  {
    accessorKey: "is_deleted",
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
        onUpdate={() => onUpdateCategory(row.original)}
        onDelete={() => onDeleteCategory(row.original)}
        onToggle={() => onToggleCategory(row.original)}
        onView={() => onViewCategory(row.original)}
      />
    ),
  },
];
