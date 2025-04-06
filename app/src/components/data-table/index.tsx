import { TGenericObject } from '@perseusfs/shared';
import {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table';
import { memo, useState } from 'react';
import { LoadingSection } from '../loading-section';
import { Input } from '../ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../ui/table';
import { Pagination } from './pagination';

type TDataTableProps<T> = {
  data: T[];
  setPagination: (
    updater: PaginationState | ((prev: PaginationState) => PaginationState)
  ) => void;
  pagination: PaginationState;
  columns: ColumnDef<T>[];
  refetch?: () => void;
  loading?: boolean;
  actions?: React.ReactNode;
  meta?: TGenericObject;
  searchKey?: string;
};

const DataTableRoot = <T,>({
  data,
  setPagination,
  pagination,
  columns,
  refetch,
  loading,
  actions,
  meta,
  searchKey
}: TDataTableProps<T>) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const table = useReactTable({
    data: data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onPaginationChange: setPagination,
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      pagination
    },
    meta
  });

  return (
    <div className="flex flex-col gap-4">
      {searchKey && (
        <div>
          <Input
            placeholder="Search files..."
            value={
              (table.getColumn(searchKey)?.getFilterValue() as string) ?? ''
            }
            onChange={(event) =>
              table.getColumn(searchKey)?.setFilterValue(event.target.value)
            }
            className="w-64"
          />
        </div>
      )}

      <div className="flex justify-between items-center h-8">
        <Pagination
          table={table}
          pageIndex={pagination.pageIndex + 1}
          pageCount={table.getPageCount()}
          refetch={refetch}
          pageSize={pagination.pageSize}
        />
        {actions && <div>{actions}</div>}
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-left"
                    style={{
                      minWidth: header.column.columnDef.size,
                      maxWidth: header.column.columnDef.size
                    }}
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
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      style={{
                        minWidth: cell.column.columnDef.size,
                        maxWidth: cell.column.columnDef.size
                      }}
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
                  {loading ? (
                    <LoadingSection size="2rem" />
                  ) : (
                    'No data available.'
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <Pagination
        table={table}
        pageIndex={pagination.pageIndex + 1}
        pageCount={table.getPageCount()}
        refetch={refetch}
        pageSize={pagination.pageSize}
      />
    </div>
  );
};

const DataTable = memo(DataTableRoot) as <T>(
  props: TDataTableProps<T>
) => JSX.Element;

export { DataTable };
