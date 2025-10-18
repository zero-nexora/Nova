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
import { useDeleteSubcategory } from "../hooks/subcategories/use-delete-subcategory";
import { useDeleteSubcategoryMultiple } from "../hooks/subcategories/use-delete-subcategory-multiple";
import { useToggleSubcategoryDeleted } from "../hooks/subcategories/use-toggle-subcategory-deleted";
import { useToggleSubcategoryDeletedMultiple } from "../hooks/subcategories/use-toggle-subcategory-deleted-multiple";
import { useDeleteImage } from "@/components/uploader/hooks/use-uploader";
import { useConfirm } from "@/stores/confirm-store";
import { useModal } from "@/stores/modal-store";
import { Subcategory } from "@/queries/admin/categories/types";
import { SubcategoryDetailCard } from "./subcategory-detail-card";
import { Error } from "@/components/global/error";
import { Empty } from "@/components/global/empty";
import { SubcategoryColumns } from "./subcategory-columns";
import { useGetAllCategories } from "../hooks/categories/use-get-all-categories";
import { UpdateSubcategoryForm } from "@/components/forms/category/update-subcategory-form";

const createSubcategoryColumns = (
  onUpdateSubcategory: (subcategory: Subcategory) => void,
  onDeleteSubcategory: (subcategory: Subcategory) => void,
  onToggleSubcategory: (subcategory: Subcategory) => void,
  onViewSubcategory: (subcategory: Subcategory) => void
) =>
  SubcategoryColumns({
    onUpdateSubcategory,
    onDeleteSubcategory,
    onToggleSubcategory,
    onViewSubcategory,
  });

export const SubcategoryDataTable = () => {
  const { categories, error } = useGetAllCategories();

  const { deleteSubcategoryAsync } = useDeleteSubcategory();
  const { deleteSubcategoryMultipleAsync } = useDeleteSubcategoryMultiple();
  const { toggleSubcategoryAsync } = useToggleSubcategoryDeleted();
  const { toggleSubcategoryMultipleAsync } =
    useToggleSubcategoryDeletedMultiple();
  const { deleteImageAsync } = useDeleteImage();
  const openModal = useModal((state) => state.open);
  const openConfirm = useConfirm((state) => state.open);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const subcategories = useMemo(
    () => categories?.flatMap((category) => category.subcategories) || [],
    [categories]
  );

  const handleUpdateSubcategory = useCallback(
    (subcategory: Subcategory) => {
      openModal({
        children: <UpdateSubcategoryForm data={subcategory} />,
        title: "Update Subcategory",
        description: "Update subcategory information",
      });
    },
    [openModal]
  );

  const handleDeleteSubcategory = useCallback(
    async (subcategory: Subcategory) => {
      openConfirm({
        title: "Permanent Deletion Warning",
        description: `Permanently delete "${subcategory.name}"? This cannot be undone.`,
        onConfirm: async () => {
          if (subcategory.public_id) {
            await deleteImageAsync({ publicId: subcategory.public_id });
          }
          await deleteSubcategoryAsync({ id: subcategory.id });
        },
      });
    },
    [deleteSubcategoryAsync, deleteImageAsync, openConfirm]
  );

  const handleToggleSubcategory = useCallback(
    async (subcategory: Subcategory) => {
      openConfirm({
        title: subcategory.is_deleted ? "Restore Subcategory" : "Move to Trash",
        description: subcategory.is_deleted
          ? "Are you sure you want to restore this subcategory?"
          : "Are you sure you want to move this subcategory to trash?",
        onConfirm: async () => {
          await toggleSubcategoryAsync({ id: subcategory.id });
        },
      });
    },
    [toggleSubcategoryAsync, openConfirm]
  );

  const handleViewSubcategory = useCallback(
    (subcategory: Subcategory) => {
      openModal({
        title: "Subcategory Details",
        children: <SubcategoryDetailCard subcategory={subcategory} />,
      });
    },
    [openModal]
  );

  const handleDeleteSelected = useCallback(async () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const selectedIds = selectedRows.map((row) => row.original.id);
    openConfirm({
      title: "Delete Multiple Subcategories",
      description: `Are you sure you want to permanently delete ${selectedIds.length} subcategories?`,
      onConfirm: async () => {
        await deleteSubcategoryMultipleAsync({ ids: selectedIds });
        table.resetRowSelection();
      },
    });
  }, [deleteSubcategoryMultipleAsync, openConfirm]);

  const handleToggleSelected = useCallback(async () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const selectedIds = selectedRows.map((row) => row.original.id);
    const isDeleted = selectedRows.some((row) => row.original.is_deleted);

    openConfirm({
      title: isDeleted
        ? "Restore Subcategories"
        : "Move Subcategories to Trash",
      description: `Are you sure you want to ${
        isDeleted ? "restore" : "move to trash"
      } ${selectedIds.length} subcategories?`,
      onConfirm: async () => {
        await toggleSubcategoryMultipleAsync({ ids: selectedIds });
        table.resetRowSelection();
      },
    });
  }, [toggleSubcategoryMultipleAsync, openConfirm]);

  const columns = useMemo(
    () =>
      createSubcategoryColumns(
        handleUpdateSubcategory,
        handleDeleteSubcategory,
        handleToggleSubcategory,
        handleViewSubcategory
      ),
    [
      handleUpdateSubcategory,
      handleDeleteSubcategory,
      handleToggleSubcategory,
      handleViewSubcategory,
    ]
  );

  const table = useReactTable({
    data: subcategories,
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
      <div className="flex items-center gap-4 py-4 flex-wrap">
        <Input
          placeholder="Search by subcategory name..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-72"
        />
        <Input
          placeholder="Search by category name..."
          value={
            (table.getColumn("category_name")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("category_name")?.setFilterValue(event.target.value)
          }
          className="max-w-72"
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
          <div className="flex gap-2">
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

export default memo(SubcategoryDataTable);
