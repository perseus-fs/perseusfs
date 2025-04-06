import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { DATE_FORMAT } from '@/statics';
import { TRequestLog } from '@perseusfs/shared';
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
import { format } from 'date-fns';
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { memo, useState } from 'react';

type TPaginationProps = {
  table: any;
  pageIndex: number;
  pageCount: number;
};

const Pagination = memo(({ table, pageIndex, pageCount }: TPaginationProps) => {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => table.firstPage()}
        disabled={!table.getCanPreviousPage()}
      >
        <ChevronsLeft />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => table.previousPage()}
        disabled={!table.getCanPreviousPage()}
      >
        <ChevronLeft />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => table.nextPage()}
        disabled={!table.getCanNextPage()}
      >
        <ChevronRight />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => table.lastPage()}
        disabled={!table.getCanNextPage()}
      >
        <ChevronsRight />
      </Button>
      <span className="flex items-center gap-1">
        <div>Page</div>
        <strong>
          {pageIndex} of {pageCount}
        </strong>
      </span>
    </div>
  );
});

const columns: ColumnDef<TRequestLog>[] = [
  {
    accessorKey: 'createdAt',
    size: 50,
    header: ({ column }) => (
      <div className="flex items-center">
        Date
        <Button
          size="icon"
          variant="ghost"
          className="ml-2"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          <ArrowUpDown />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const createdAt = row.getValue('createdAt');
      return (
        <div className="text-left">
          {createdAt ? format(+createdAt, DATE_FORMAT) : '-'}
        </div>
      );
    }
  },
  {
    accessorKey: 'status',
    size: 50,
    header: ({ column }) => (
      <div className="flex items-center">
        Status
        <Button
          size="icon"
          variant="ghost"
          className="ml-2"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          <ArrowUpDown />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const statusVariant =
        row.getValue('status') === 200 ? 'default' : 'destructive';

      return (
        <Badge variant={statusVariant} className="mr-2">
          {row.getValue('status')}
        </Badge>
      );
    }
  },
  {
    accessorKey: 'method',
    size: 50,
    header: () => <div className="flex items-center">Method</div>,
    cell: ({ row }) => (
      <div className="uppercase text-left">{row.getValue('method')}</div>
    )
  },
  {
    accessorKey: 'address',
    size: 70,
    header: () => <div className="flex items-center">Address</div>,
    cell: ({ row }) => {
      return (
        <a
          href={`https://ipinfo.io/${row.getValue('address')}`}
          target="_blank"
          rel="noreferrer"
        >
          {row.getValue('address') || '-'}
        </a>
      );
    }
  },
  {
    accessorKey: 'country',
    size: 70,
    header: () => <div className="flex items-center">Country</div>,
    cell: ({ row }) => {
      return (
        <div className="uppercase text-left">
          {row.getValue('country')} asdas
        </div>
      );
    }
  },
  {
    accessorKey: 'host',
    size: 70,
    header: () => <div className="flex items-center">Host</div>,
    cell: ({ row }) => {
      return <div className="text-left">{row.getValue('host') || '-'}</div>;
    }
  },
  {
    accessorKey: 'path',
    size: 120,
    header: () => <div className="flex items-center">Path</div>,
    cell: ({ row }) => (
      <div className="lowercase text-left">{row.getValue('path')}</div>
    )
  },
  {
    accessorKey: 'time',
    size: 20,
    header: ({ column }) => (
      <div className="flex items-center">
        Latency
        <Button
          size="icon"
          variant="ghost"
          className="ml-2"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          <ArrowUpDown />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const time = parseFloat(row.getValue('time'));

      return (
        <div className="text-left">{time ? `${time.toFixed(2)} ms` : '-'}</div>
      );
    }
  }
];

type TLogsTableProps = {
  logs: TRequestLog[];
  setPagination: (
    updater: PaginationState | ((prev: PaginationState) => PaginationState)
  ) => void;
  pagination: PaginationState;
};

const LogsTable = memo(
  ({ logs, setPagination, pagination }: TLogsTableProps) => {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
      {}
    );

    const table = useReactTable({
      data: logs,
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
      }
    });

    return (
      <div className="flex flex-col gap-4">
        <Pagination
          table={table}
          pageIndex={pagination.pageIndex + 1}
          pageCount={table.getPageCount()}
        />
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
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
                    );
                  })}
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
                        className="p-4"
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
                    No results.
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
        />
      </div>
    );
  }
);

export { LogsTable };
