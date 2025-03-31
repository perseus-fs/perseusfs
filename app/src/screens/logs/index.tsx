import { DataTable } from '@/components/data-table';
import { ColumnHeader } from '@/components/data-table/column-header';
import { Badge } from '@/components/ui/badge';
import { Tooltip } from '@/components/ui/tooltip';
import { getApiUrl } from '@/helpers/get-api-url';
import { useToken } from '@/hooks/use-token';
import { DATE_FORMAT, DEFAULT_PAGE_SIZE } from '@/statics';
import { TRequestLog } from '@perseusfs/shared';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import { format } from 'date-fns';
import { memo, useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

const HTTP_CODES = {
  200: 'Success',
  201: 'Created',
  202: 'Accepted',
  204: 'No Content',
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  409: 'Conflict',
  500: 'Internal Server Error'
};

const columns: ColumnDef<TRequestLog>[] = [
  {
    accessorKey: 'createdAt',
    size: 74,
    header: ({ column }) => (
      <ColumnHeader column={column} label="Date" sortable />
    ),
    cell: ({ row }) => {
      const createdAt = row.getValue('createdAt');
      return <span>{createdAt ? format(+createdAt, DATE_FORMAT) : '-'}</span>;
    }
  },
  {
    accessorKey: 'status',
    size: 30,
    header: ({ column }) => (
      <ColumnHeader column={column} label="Status" sortable />
    ),
    cell: ({ row }) => {
      const statusVariant =
        row.getValue('status') === 200 ? 'default' : 'destructive';

      return (
        <Tooltip content={HTTP_CODES[row.getValue('status') as string]}>
          <Badge variant={statusVariant} className="mr-2 cursor-default">
            {row.getValue('status')}
          </Badge>
        </Tooltip>
      );
    }
  },
  {
    accessorKey: 'method',
    size: 30,
    header: ({ column }) => (
      <ColumnHeader column={column} label="Method" sortable />
    ),
    cell: ({ row }) => (
      <span className="uppercase">{row.getValue('method')}</span>
    )
  },
  {
    accessorKey: 'path',
    size: 100,
    header: ({ column }) => <ColumnHeader column={column} label="Path" />,
    cell: ({ row }) => (
      <span className="lowercase truncate">{row.getValue('path')}</span>
    )
  },
  {
    accessorKey: 'address',
    size: 70,
    header: ({ column }) => <ColumnHeader column={column} label="Address" />,
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
    size: 50,
    header: ({ column }) => <ColumnHeader column={column} label="Country" />,
    cell: ({ row }) => {
      const country: string = row.getValue('country');

      if (!country) {
        return <span className="text-muted-foreground">N/A</span>;
      }

      return <span>{country}</span>;
    }
  },
  {
    accessorKey: 'host',
    size: 70,
    header: ({ column }) => <ColumnHeader column={column} label="Host" />,
    cell: ({ row }) => {
      return <span>{row.getValue('host') || '-'}</span>;
    }
  },
  {
    accessorKey: 'time',
    size: 40,
    header: ({ column }) => (
      <ColumnHeader column={column} label="Latency" sortable />
    ),
    cell: ({ row }) => {
      const time = parseFloat(row.getValue('time'));

      return <span>{time ? `${time.toFixed(2)} ms` : '-'}</span>;
    }
  }
];

const Logs = memo(() => {
  const token = useToken();
  const [logs, setLogs] = useState<TRequestLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE
  });

  const fetchLogs = useCallback(async () => {
    setLoading(true);

    const response = await fetch(`${getApiUrl()}/request_logs`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    setLoading(false);

    if (!response.ok) {
      toast.error('Failed to fetch logs');
      return;
    }

    const { logs: newLogs } = await response.json();

    setLogs(newLogs);
    setPagination((prev) => ({
      ...prev,
      pageCount: Math.ceil(newLogs.length / prev.pageSize)
    }));
  }, [token]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="w-full overflow-auto">
      <DataTable<TRequestLog>
        data={logs}
        setPagination={setPagination}
        pagination={pagination}
        columns={columns}
        refetch={fetchLogs}
        loading={loading}
      />
    </div>
  );
});

export { Logs };
