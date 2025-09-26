"use client";

import React, { useEffect } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  RowSelectionState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DataTableSkeleton } from "@/components/global/data-table-skeleton";
import { Download, Trash2 } from "lucide-react";
import { Pagination, Product } from "@/queries/admin/products/types";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

interface ProductTableProps {
  products: Product[];
  columns: ColumnDef<Product>[];
  pagination: Pagination | null;
  isFetching: boolean;
  sorting: SortingState;
  setSorting: React.Dispatch<React.SetStateAction<SortingState>>;
  columnFilters: ColumnFiltersState;
  setColumnFilters: React.Dispatch<React.SetStateAction<ColumnFiltersState>>;
  columnVisibility: VisibilityState;
  setColumnVisibility: React.Dispatch<React.SetStateAction<VisibilityState>>;
  rowSelection: RowSelectionState;
  setRowSelection: React.Dispatch<React.SetStateAction<RowSelectionState>>;
  page: number;
  setPage: (page: number) => void;
  onBulkDelete?: () => Promise<void>;
  onBulkToggle?: () => Promise<void>;
}

export const ProductTable = ({
  products,
  columns,
  pagination,
  isFetching,
  sorting,
  setSorting,
  columnFilters,
  setColumnFilters,
  columnVisibility,
  setColumnVisibility,
  rowSelection,
  setRowSelection,
  page,
  setPage,
  onBulkDelete,
  onBulkToggle,
}: ProductTableProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const table = useReactTable<Product>({
    data: products,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
    manualSorting: true,
    pageCount: pagination?.totalPages || 0,
    enableRowSelection: true,
    getRowId: (row) => row.id,
  });

  useEffect(() => {
    if (searchParams.get("page")) {
      setPage(parseInt(searchParams.get("page") || "1"));
    }
  }, [searchParams]);

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedCount = selectedRows.length;

  const handleBulkDelete = async () => {
    if (onBulkDelete) {
      await onBulkDelete();
    }
  };

  const handleBulkToggle = async () => {
    if (onBulkToggle) {
      await onBulkToggle();
    }
  };

  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(name, value);
    return params.toString();
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    setRowSelection({});

    router.push(`${pathname}?${createQueryString("page", newPage.toString())}`);
  };

  return (
    <Card className="bg-muted/10 border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            Products ({pagination?.totalCount || 0})
            {selectedCount > 0 && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({selectedCount} selected)
              </span>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {/* Bulk Actions */}
            {selectedCount > 0 && (
              <div className="flex items-center gap-2 mr-2 border-r pr-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkToggle}
                  className="gap-2"
                >
                  Toggle Selected ({selectedCount})
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Selected ({selectedCount})
                </Button>
              </div>
            )}

            {/* Export */}
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={header.id === "select" ? "w-12" : ""}
                    >
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
              {isFetching ? (
                <DataTableSkeleton columnCount={columns.length} />
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={row.getIsSelected() ? "bg-muted/50" : ""}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cell.column.id === "select" ? "w-12" : ""}
                      >
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
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No products found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Selection Info */}
        {selectedCount > 0 && (
          <div className="flex items-center justify-between py-2 text-sm text-muted-foreground">
            <span>
              {selectedCount} of {table.getFilteredRowModel().rows.length}{" "}
              row(s) selected
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRowSelection({})}
            >
              Clear selection
            </Button>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <>
            <Separator className="my-4" />
            <div className="flex items-center justify-end">
              <div className="flex items-center space-x-6 lg:space-x-8">
                <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                  Page {pagination.page} of {pagination.totalPages}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => handlePageChange(1)}
                    disabled={!pagination.hasPreviousPage}
                  >
                    <span className="sr-only">Go to first page</span>⟪
                  </Button>
                  <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={!pagination.hasPreviousPage}
                  >
                    <span className="sr-only">Go to previous page</span>⟨
                  </Button>
                  <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={!pagination.hasNextPage}
                  >
                    <span className="sr-only">Go to next page</span>⟩
                  </Button>
                  <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => handlePageChange(pagination.totalPages)}
                    disabled={!pagination.hasNextPage}
                  >
                    <span className="sr-only">Go to last page</span>⟫
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
