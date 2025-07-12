import { openDialog, requestConfirmation } from '@/actions/dialog';
import { DataTable } from '@/components/data-table';
import { Dialog } from '@/components/dialogs';
import { LoadingSection } from '@/components/loading-section';
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
import { downloadFile } from '@/helpers/download-file';
import { getApiUrl } from '@/helpers/get-api-url';
import { getFileUrl } from '@/helpers/get-file-url';
import { useBucket } from '@/hooks/use-bucket';
import { useIsDemoModeLocked } from '@/hooks/use-is-demo-mode-locked';
import { DATE_FORMAT, DEFAULT_PAGE_SIZE } from '@/statics';
import { IOPermission, TBucket, TFile } from '@perseusfs/shared';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import { format } from 'date-fns';
import { filesize } from 'filesize';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';
import { memo, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { toast } from 'sonner';
import { Header } from './header';
import { MultiSelectActions } from './multi-selection-actions';

const columns: ColumnDef<TFile>[] = [
  {
    id: 'select',
    size: 5,
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
    size: 100,
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
        <div className="lowercase text-left truncate">
          {pathComp}
          {row.getValue('name')}
        </div>
      );
    }
  },
  {
    accessorKey: 'hash',
    size: 100,
    header: () => <div className="flex items-center">Hash</div>,
    cell: ({ row }) => (
      <div className="lowercase text-left">{row.getValue('hash')}</div>
    )
  },
  {
    accessorKey: 'createdAt',
    size: 40,
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
    size: 20,
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
    accessorKey: 'contentType',
    size: 40,
    header: ({ column }) => (
      <div className="flex items-center">
        MIME type
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
      const contentType = row.getValue('contentType') as string;

      return <div className="text-left">{contentType}</div>;
    }
  },
  {
    id: 'actions',
    size: 5,
    enableHiding: false,
    cell: ({ row, table }) => {
      const file = row.original;
      const { bucket, token, refetch, isDemoLocked } = table.options.meta as {
        bucket: TBucket;
        token: string;
        refetch: () => void;
        isDemoLocked: boolean;
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
          toast.success('File deleted successfully.');
          refetch();
        } else {
          toast.error('An error occurred while deleting the file.');
        }
      };

      const onOpenInNewTab = () => {
        window.open(getFileUrl(bucket.name, file.name, file.path));
      };

      const onDownloadClick = async () => {
        const url = getFileUrl(bucket.name, file.name, file.path);

        console.log('! Downloading file from URL:', url);

        await downloadFile(url, file.name);
      };

      const onCopyDirectLinkClick = () => {
        navigator.clipboard.writeText(
          getFileUrl(bucket.name, file.name, file.path)
        );

        toast.info('Direct link copied to clipboard.');
      };

      const onShareClick = () => {
        if (isDemoLocked) return;

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
            <DropdownMenuItem onClick={onOpenInNewTab}>
              Open in new tab
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onShareClick} disabled={isDemoLocked}>
              Share
            </DropdownMenuItem>
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

const Bucket = memo(() => {
  const isDemoLocked = useIsDemoModeLocked();
  const [selectedRowIds, setSelectedRowIds] = useState<number[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE
  });

  const { id } = useParams<{
    id: string;
  }>();

  const { files, bucket, loading, userPermissions, refetch } = useBucket(
    +(id || 0)
  );

  const meta = useMemo(
    () => ({
      token: localStorage.getItem('token'),
      bucket,
      refetch,
      isDemoLocked
    }),
    [bucket, refetch, isDemoLocked]
  );

  if (loading) {
    return <LoadingSection />;
  }

  if (!bucket) {
    return <div>Bucket not found</div>;
  }

  return (
    <div className="flex flex-col w-full gap-2">
      <Header
        bucket={bucket}
        files={files}
        refetch={refetch}
        userPermissions={userPermissions}
      />
      <DataTable<TFile>
        data={files}
        setPagination={setPagination}
        pagination={pagination}
        columns={columns}
        refetch={refetch}
        loading={loading}
        meta={meta}
        searchKey="name"
        onSelectedRowIdsChange={setSelectedRowIds}
        selectedRowIds={selectedRowIds}
        multiSelectionSlot={(selectedRowIds) => (
          <MultiSelectActions
            selectedRowIds={selectedRowIds}
            refetch={refetch}
          />
        )}
      />
    </div>
  );
});

export { Bucket };
