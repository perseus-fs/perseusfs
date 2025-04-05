import { openDialog, requestConfirmation } from '@/actions/dialog';
import { Dialog } from '@/components/dialogs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { getApiUrl } from '@/helpers/get-api-url';
import { getFileUrl } from '@/helpers/get-file-url';
import { useToken } from '@/hooks/use-token';
import { DATE_FORMAT } from '@/statics';
import { IOPermission, TBucket, TFile } from '@perseusfs/shared';
import {
  ColumnDef,
  ColumnFiltersState,
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
import { filesize } from 'filesize';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';
import { memo, useState } from 'react';
import { toast } from 'sonner';

export const columns: ColumnDef<TFile>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
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
    enableHiding: false
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <div className="flex items-center">
        File name
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
      const { path } = row.original;

      const pathComp = path ? (
        <Badge variant="outline" className="mr-2">
          {path}
        </Badge>
      ) : null;

      return (
        <div className="lowercase text-left">
          {pathComp}
          {row.getValue('name')}
        </div>
      );
    }
  },
  {
    accessorKey: 'hash',
    header: () => <div className="flex items-center">Hash</div>,
    cell: ({ row }) => (
      <div className="lowercase text-left">{row.getValue('hash')}</div>
    )
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <div className="flex items-center">
        Uploaded at
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
    accessorKey: 'size',
    header: ({ column }) => (
      <div className="flex items-center">
        Size
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
      const size = parseInt(row.getValue('size') as string);

      return <div className="text-left">{filesize(size)}</div>;
    }
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row, table }) => {
      const file = row.original;
      const { bucket, token, refetch } = table.options.meta as {
        bucket: TBucket;
        token: string;
        refetch: () => void;
      };

      const onDeleteClick = async () => {
        const result = await requestConfirmation({
          title: `Deleting ${file.name}`,
          message: `Are you sure you want to delete this file? This action is irreversible.`,
          confirmLabel: 'Delete'
        });

        if (!result) return;

        const response = await fetch(`${getApiUrl()}/files/${file.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        });

        if (response.ok) {
          toast('File deleted successfully.');
          refetch();
        } else {
          toast('An error occurred while deleting the file.');
        }
      };

      const onDownloadClick = () => {
        window.open(getFileUrl(bucket.name, file.name, file.path));
      };

      const onCopyDirectLinkClick = () => {
        navigator.clipboard.writeText(
          getFileUrl(bucket.name, file.name, file.path)
        );

        toast.info('Direct link copied to clipboard.');
      };

      const onShareClick = () => {
        openDialog(Dialog.SHARE_FILE, {
          file,
          bucket
        });
      };

      const canGenerateDirectLink =
        bucket.read === IOPermission.PUBLIC ||
        bucket.read === IOPermission.CUSTOM;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDownloadClick}>
              Download
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onShareClick}>Share</DropdownMenuItem>
            <DropdownMenuItem
              onClick={onCopyDirectLinkClick}
              disabled={!canGenerateDirectLink}
            >
              Copy direct link
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDeleteClick}>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
  }
];

type TFilesTableProps = {
  bucket: TBucket;
  files: TFile[];
  refetch: () => void;
};

const FilesTable = memo(({ bucket, files, refetch }: TFilesTableProps) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const token = useToken();

  const table = useReactTable({
    data: files,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection
    },
    meta: {
      bucket,
      token,
      refetch
    }
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Search files..."
          value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('name')?.setFilterValue(event.target.value)
          }
          className="w-64"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="text-left">
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
                    <TableCell key={cell.id} className="text-left">
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
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{' '}
          {table.getFilteredRowModel().rows.length} files(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
});

export { FilesTable };
