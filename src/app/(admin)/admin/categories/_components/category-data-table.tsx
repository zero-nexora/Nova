"use client";

import {
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { memo, useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetAllCategories } from "../hooks/categories/use-get-all-categories";
import { useDeleteCategory } from "../hooks/categories/use-delete-category";
import { useDeleteCategoryMultiple } from "../hooks/categories/use-delete-category-multiple";
import { useToggleCategoryDeleted } from "../hooks/categories/use-toggle-category-deleted";
import { useToggleCategoryDeletedMultiple } from "../hooks/categories/use-toggle-category-deleted-multiple";
import { CategoryDetailCard } from "./category-detail-card";
import { CategoryColumns } from "./category-columns";
import { useModal } from "@/stores/modal-store";
import { useDeleteImage } from "@/components/uploader/hooks/use-uploader";
import { useConfirm } from "@/stores/confirm-store";
import { Category } from "@/queries/admin/categories/types";
import { UpdateCategoryForm } from "@/components/forms/category/update-category-form";
import { Error } from "@/components/global/error";
import { Empty } from "@/components/global/empty";

const createCategoryColumns = (
  onUpdateCategory: (category: Category) => void,
  onDeleteCategory: (category: Category) => void,
  onToggleCategory: (category: Category) => void,
  onViewCategory: (category: Category) => void
) =>
  CategoryColumns({
    onUpdateCategory,
    onDeleteCategory,
    onToggleCategory,
    onViewCategory,
  });

export const CategoryDataTable = () => {
  const { categories, error } = useGetAllCategories();
  const { deleteCategoryAsync } = useDeleteCategory();
  const { deleteCategoryMultipleAsync } = useDeleteCategoryMultiple();
  const { toggleCategoryAsync } = useToggleCategoryDeleted();
  const { toggleCategoryMultipleAsync } = useToggleCategoryDeletedMultiple();
  const { deleteImageAsync } = useDeleteImage();
  const openModal = useModal((state) => state.open);
  const openConfirm = useConfirm((state) => state.open);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const data = useMemo(() => categories || [], [categories]);

  const handleUpdateCategory = useCallback(
    (category: Category) => {
      openModal({
        children: <UpdateCategoryForm data={category} />,
        title: "Update Category",
        description: "Update category information",
      });
    },
    [openModal]
  );

  const handleDeleteCategory = useCallback(
    async (category: Category) => {
      openConfirm({
        title: "Permanent Deletion Warning",
        description: `Permanently delete "${category.name}"? This cannot be undone.`,
        onConfirm: async () => {
          if (category.public_id) {
            await deleteImageAsync({ publicId: category.public_id });
          }
          await deleteCategoryAsync({ id: category.id });
        },
      });
    },
    [deleteCategoryAsync, deleteImageAsync, openConfirm]
  );

  const handleToggleCategory = useCallback(
    async (category: Category) => {
      openConfirm({
        title: category.is_deleted ? "Restore Category" : "Move to Trash",
        description: category.is_deleted
          ? "Are you sure you want to restore this category?"
          : "Are you sure you want to move this category to trash?",
        onConfirm: async () => {
          await toggleCategoryAsync({ id: category.id });
        },
      });
    },
    [toggleCategoryAsync, openConfirm]
  );

  const handleViewCategory = useCallback(
    (category: Category) => {
      openModal({
        title: "Category Details",
        children: <CategoryDetailCard category={category} />,
      });
    },
    [openModal]
  );

  const handleDeleteSelected = useCallback(async () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const selectedIds = selectedRows.map((row) => row.original.id);
    openConfirm({
      title: "Delete Multiple Categories",
      description: `Are you sure you want to permanently delete ${selectedIds.length} categories?`,
      onConfirm: async () => {
        await deleteCategoryMultipleAsync({ ids: selectedIds });
        table.resetRowSelection();
      },
    });
  }, [deleteCategoryMultipleAsync, openConfirm]);

  const handleToggleSelected = useCallback(async () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const selectedIds = selectedRows.map((row) => row.original.id);
    const isDeleted = selectedRows.some((row) => row.original.is_deleted);

    openConfirm({
      title: isDeleted ? "Restore Categories" : "Move Categories to Trash",
      description: `Are you sure you want to ${
        isDeleted ? "restore" : "move to trash"
      } ${selectedIds.length} categories?`,
      onConfirm: async () => {
        await toggleCategoryMultipleAsync({ ids: selectedIds });
        table.resetRowSelection();
      },
    });
  }, [toggleCategoryMultipleAsync, openConfirm]);

  const columns = useMemo(
    () =>
      createCategoryColumns(
        handleUpdateCategory,
        handleDeleteCategory,
        handleToggleCategory,
        handleViewCategory
      ),
    [
      handleUpdateCategory,
      handleDeleteCategory,
      handleToggleCategory,
      handleViewCategory,
    ]
  );

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center gap-4 py-4">
        <Input
          placeholder="Search by name..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <Select
          value={
            (table.getColumn("is_deleted")?.getFilterValue() as string) ?? "all"
          }
          onValueChange={(value) =>
            table.getColumn("is_deleted")?.setFilterValue(value)
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="true">Deleted</SelectItem>
            <SelectItem value="false">Active</SelectItem>
          </SelectContent>
        </Select>
        {table.getFilteredSelectedRowModel().rows.length > 0 && (
          <div className="ml-auto flex gap-2">
            <Button variant="destructive" onClick={handleDeleteSelected}>
              Delete Selected
            </Button>
            <Button variant="outline" onClick={handleToggleSelected}>
              Toggle Selected
            </Button>
          </div>
        )}
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-left">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {!error && table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  className="text-center"
                  colSpan={table.getAllColumns().length}
                >
                  <Empty />
                </TableCell>
              </TableRow>
            )}
            {error && (
              <TableRow>
                <TableCell
                  className="text-center"
                  colSpan={table.getAllColumns().length}
                >
                  <Error />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="text-muted-foreground py-4 text-sm">
        {table.getFilteredSelectedRowModel().rows.length} of{" "}
        {table.getFilteredRowModel().rows.length} row(s) selected.
      </div>
    </div>
  );
};

export default memo(CategoryDataTable);
