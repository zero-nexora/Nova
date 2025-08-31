import { ActionMenu } from "@/components/global/action-menu";
import { Badge } from "@/components/ui/badge";
import { CategoryColumn } from "@/lib/types";
import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";

type CategoryColumnsProps = {
  onEdit: (category: CategoryColumn) => void;
  onDelete: (category: CategoryColumn) => void;
  onView?: (category: CategoryColumn) => void;
};

export const createCategoryColumns = ({
  onEdit,
  onDelete,
  onView,
}: CategoryColumnsProps): ColumnDef<CategoryColumn>[] => [
  {
    accessorKey: "name",
    header: "Category Name",
    cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
    enableSorting: true,
  },
  {
    accessorKey: "parentName",
    header: "Parent",
    cell: ({ row }) => row.original.parentName ?? "Root",
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
    header: "Created At",
    cell: ({ row }) => (
      <div className="text-sm">
        {new Date(row.original.created_at).toLocaleDateString()}
      </div>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "updated_at",
    header: "Updated At",
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
        <Badge variant="destructive">Deleted</Badge>
      ) : (
        <Badge variant="default">Active</Badge>
      ),
    enableSorting: true,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <ActionMenu
        onView={onView ? () => onView(row.original) : undefined}
        onEdit={() => onEdit(row.original)}
        onDelete={() => onDelete(row.original)}
      />
    ),
    enableSorting: false,
  },
];
