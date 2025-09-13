import { ActionMenu } from "@/components/global/action-menu";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import Image from "next/image";

export interface CategoryRow {
  id: string;
  name: string;
  image_url: string | null;
  created_at: Date;
  updated_at: Date;
  is_deleted: boolean;
  parentName: string;
  public_id: string | null;
  parentId: string | null;
}

interface CategoryColumnsProps {
  onEdit: (category: CategoryRow) => void;
  onDelete: (category: CategoryRow) => void;
  onToggle: (category: CategoryRow) => void;
}

export const createCategoryColumns = ({
  onEdit,
  onDelete,
  onToggle,
}: CategoryColumnsProps): ColumnDef<CategoryRow>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
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
    header: ({ column }) => {
      return (
        <>
          <div
            className="cursor-pointer flex items-center gap-2"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name
            <ArrowUpDown className="h-4 w-4" />
          </div>
        </>
      );
    },
    cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
    enableSorting: true,
  },
  {
    accessorKey: "parentName",
    header: "Parent",
    cell: ({ row }) => row.original.parentName,
    enableSorting: true,
  },
  {
    accessorKey: "image_url",
    header: "Image",
    cell: ({ row }) =>
      row.original.image_url ? (
        <div className="relative h-10 w-10">
          <Image
            src={row.original.image_url}
            alt={row.original.name}
            className="h-full w-full rounded-md object-cover"
            fill
            sizes="40px"
          />
        </div>
      ) : (
        <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center text-xs text-muted-foreground">
          No Image
        </div>
      ),
    enableSorting: false,
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => {
      return (
        <>
          <div
            className="cursor-pointer flex items-center gap-2"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Created At
            <ArrowUpDown className="h-4 w-4" />
          </div>
        </>
      );
    },
    cell: ({ row }) => (
      <div className="text-sm">
        {new Date(row.original.created_at).toLocaleDateString()}
      </div>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "updated_at",
    header: ({ column }) => {
      return (
        <>
          <div
            className="cursor-pointer flex items-center gap-2"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Updated At
            <ArrowUpDown className="h-4 w-4" />
          </div>
        </>
      );
    },
    cell: ({ row }) => (
      <div className="text-sm">
        {new Date(row.original.updated_at).toLocaleDateString()}
      </div>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "is_deleted",
    header: "Status",
    cell: ({ row }) =>
      row.original.is_deleted ? (
        <Badge
          variant="destructive"
          className="cursor-pointer"
          onClick={() => onToggle(row.original)}
        >
          Deleted
        </Badge>
      ) : (
        <Badge
          variant="default"
          className="cursor-pointer"
          onClick={() => onToggle(row.original)}
        >
          Active
        </Badge>
      ),
    enableSorting: true,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <ActionMenu
        onUpdate={() => onEdit(row.original)}
        onDelete={() => onDelete(row.original)}
      />
    ),
    enableSorting: false,
  },
];
