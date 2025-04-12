import { requestConfirmation } from '@/actions/dialog';
import { DataTable } from '@/components/data-table';
import { ColumnHeader } from '@/components/data-table/column-header';
import { LoadingSection } from '@/components/loading-section';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { getApiUrl } from '@/helpers/get-api-url';
import { useIsDemoModeLocked } from '@/hooks/use-is-demo-mode-locked';
import { useRemoteUsers } from '@/hooks/use-remote-users';
import { useToken } from '@/hooks/use-token';
import { DATE_FORMAT, DEFAULT_PAGE_SIZE } from '@/statics';
import { TUser } from '@perseusfs/shared';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import { format } from 'date-fns';
import { upperFirst } from 'lodash';
import { MoreHorizontal } from 'lucide-react';
import { memo, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

const columns: ColumnDef<TUser>[] = [
  {
    accessorKey: 'name',
    size: 20,
    header: ({ column }) => <ColumnHeader column={column} label="Name" />,
    cell: ({ row }) => <span>{row.getValue('name')}</span>
  },
  {
    accessorKey: 'email',
    size: 20,
    header: ({ column }) => <ColumnHeader column={column} label="Email" />,
    cell: ({ row }) => <span>{row.getValue('email') || 'N/A'}</span>
  },
  {
    accessorKey: 'role',
    size: 20,
    header: ({ column }) => <ColumnHeader column={column} label="Role" />,
    cell: ({ row }) => <span>{upperFirst(row.getValue('role'))}</span>
  },
  {
    accessorKey: 'lastSeen',
    size: 20,
    header: ({ column }) => (
      <ColumnHeader column={column} label="Last seen" sortable />
    ),
    cell: ({ row }) => {
      const lastSeen = row.getValue('lastSeen');

      return (
        <span>{lastSeen ? format(+lastSeen, DATE_FORMAT) : 'Never'} </span>
      );
    }
  },
  {
    accessorKey: 'createdAt',
    size: 20,
    header: ({ column }) => (
      <ColumnHeader column={column} label="Created at" sortable />
    ),
    cell: ({ row }) => {
      const createdAt = row.getValue('createdAt');

      return (
        <span>{createdAt ? format(+createdAt, DATE_FORMAT) : 'Never'} </span>
      );
    }
  },
  {
    id: 'actions',
    size: 5,
    enableHiding: false,
    cell: ({ row, table }) => {
      const user = row.original;

      const { token, refetch, navigate, isDemoLocked } = table.options.meta as {
        token: string;
        refetch: () => void;
        navigate: (path: string) => void;
        isDemoLocked: boolean;
      };

      const onDeleteClick = async () => {
        const result = await requestConfirmation({
          title: `Deleting ${user.name}`,
          message: `Are you sure you want to delete this user? This action cannot be undone.`,
          confirmLabel: 'Delete'
        });

        if (!result) return;

        const response = await fetch(`${getApiUrl()}/users/${user.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        });

        if (response.ok) {
          toast.success('User deleted successfully.');
          refetch();
        } else {
          toast.error('An error occurred while deleting the file.');
        }
      };

      const onEditClick = () => {
        navigate(`/users/${user.id}/edit`);
      };

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
            <DropdownMenuItem
              onClick={onEditClick}
              disabled={user.id === 1 || isDemoLocked}
            >
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onDeleteClick}
              disabled={user.id === 1 || isDemoLocked}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
  }
];

const Users = memo(() => {
  const navigate = useNavigate();
  const isDemoLocked = useIsDemoModeLocked();
  const token = useToken();

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE
  });

  const { users, loading, refetch } = useRemoteUsers();

  const meta = useMemo(
    () => ({ token, navigate, refetch, isDemoLocked }),
    [token, navigate, refetch, isDemoLocked]
  );

  if (loading) {
    return <LoadingSection />;
  }

  return (
    <div className="flex flex-col w-full gap-2">
      <DataTable<TUser>
        data={users}
        setPagination={setPagination}
        pagination={pagination}
        columns={columns}
        refetch={refetch}
        loading={loading}
        actions={
          <Button
            size="sm"
            onClick={() => navigate('/users/create')}
            disabled={isDemoLocked}
          >
            Create user
          </Button>
        }
        meta={meta}
      />
    </div>
  );
});

export { Users };
