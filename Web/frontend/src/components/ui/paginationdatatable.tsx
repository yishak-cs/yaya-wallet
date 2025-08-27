"use client"

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table"

import type { ColumnDef, ColumnFiltersState, SortingState } from "@tanstack/react-table"

import * as React from "react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface ExternalPaginationDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  onRowClick?: (row: any) => void
  getRowClassName?: (row: TData) => string
  // External pagination props
  currentPage: number
  onPageChange: (page: number) => void
  loading?: boolean
}

export default function ExternalPaginationDataTable<TData, TValue>({
  columns,
  data,
  onRowClick,
  getRowClassName,
  currentPage,
  onPageChange,
  loading = false,
}: ExternalPaginationDataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [selectedRowId, setSelectedRowId] = React.useState<string | null>(null)

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true, // Important: tells the table pagination is handled externally
    state: {
      sorting,
      columnFilters,
    },
  })

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                    <span className="ml-2">Loading...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                // Build base classes
                let rowClasses = onRowClick ? "cursor-pointer hover:bg-gray-50" : ""

                // Add selected row styling
                if (selectedRowId === row.id) {
                  rowClasses += " bg-blue-50"
                }

                // Add custom row styling if provided
                if (getRowClassName) {
                  rowClasses += " " + getRowClassName(row.original)
                }

                return (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    onClick={() => {
                      setSelectedRowId(row.id)
                      if (onRowClick) {
                        onRowClick(row)
                      }
                    }}
                    className={rowClasses.trim()}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* External pagination controls */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-500">
          Page {currentPage}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
