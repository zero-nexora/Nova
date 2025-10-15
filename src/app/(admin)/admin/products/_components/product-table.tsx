"use client";

import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";
import { Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Empty } from "@/components/global/empty";
import { Separator } from "@/components/ui/separator";
import { ProductResponse } from "@/queries/admin/products/types";
import { useProductFilters } from "../hooks/products/use-product-fillters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  RowSelectionState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ProductTableProps {
  products: ProductResponse[];
  columns: ColumnDef<ProductResponse>[];
  totalProducts: number;
  currentPage: number;
  pageSize: number;
  isRefetching: boolean;
  onBulkDelete?: (selectedProducts: ProductResponse[]) => Promise<void>;
  onBulkToggle?: (selectedIds: string[]) => Promise<void>;
}

export const ProductTable = ({
  products,
  columns,
  totalProducts,
  currentPage,
  pageSize,
  onBulkDelete,
  onBulkToggle,
  isRefetching,
}: ProductTableProps) => {
  const { updateFilter } = useProductFilters();

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const totalPages = useMemo(
    () => Math.ceil(totalProducts / pageSize),
    [totalProducts, pageSize]
  );

  const hasPreviousPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;

  const table = useReactTable<ProductResponse>({
    data: products,
    columns,
    state: {
      rowSelection,
      pagination: {
        pageIndex: currentPage - 1,
        pageSize: pageSize,
      },
    },
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
    pageCount: totalPages,
    enableRowSelection: true,
    getRowId: (row) => row.id,
  });

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedCount = selectedRows.length;
  const selectedProducts = selectedRows.map((row) => row.original);
  const selectedIds = selectedProducts.map((p) => p.id);

  const handleBulkDelete = async () => {
    if (onBulkDelete && selectedProducts.length > 0) {
      await onBulkDelete(selectedProducts);
      setRowSelection({});
    }
  };

  const handleBulkToggle = async () => {
    if (onBulkToggle && selectedIds.length > 0) {
      await onBulkToggle(selectedIds);
      setRowSelection({});
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;

    updateFilter("page", newPage);
  };

  return (
    <Card className="bg-muted/10 border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            Products ({totalProducts})
            {selectedCount > 0 && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({selectedCount} selected)
              </span>
            )}
          </CardTitle>

          <div className="flex items-center gap-2">
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

            {/* Export Button */}
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Table */}
        <div className={cn(isRefetching && "opacity-80 pointer-events-none")}>
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
              {table.getRowModel().rows?.length ? (
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
                    className="text-center"
                  >
                    <Empty />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Selection Info */}
        {selectedCount > 0 && (
          <div className="flex items-center justify-between py-3 text-sm text-muted-foreground">
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
        {totalPages > 1 && (
          <>
            <Separator className="mb-4" />
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * pageSize + 1} to{" "}
                {Math.min(currentPage * pageSize, totalProducts)} of{" "}
                {totalProducts} products
              </div>

              <div className="flex items-center space-x-6 lg:space-x-8">
                <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                  Page {currentPage} of {totalPages}
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => handlePageChange(1)}
                    disabled={!hasPreviousPage}
                  >
                    <span className="sr-only">Go to first page</span>⟪
                  </Button>
                  <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!hasPreviousPage}
                  >
                    <span className="sr-only">Go to previous page</span>⟨
                  </Button>
                  <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!hasNextPage}
                  >
                    <span className="sr-only">Go to next page</span>⟩
                  </Button>
                  <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => handlePageChange(totalPages)}
                    disabled={!hasNextPage}
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
