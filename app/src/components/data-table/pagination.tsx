import { Button } from '@/components/ui/button';
import { useReactTable } from '@tanstack/react-table';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  RefreshCcw
} from 'lucide-react';
import { memo, useCallback } from 'react';
import { PerPage } from './per-page';

type TPaginationProps = {
  table: ReturnType<typeof useReactTable<any>>;
  pageIndex: number;
  pageCount: number;
  pageSize: number;
  refetch?: () => void;
  selectedRowIds?: number[];
  multiSelectionSlot?: (selectedRowIds: number[]) => React.ReactNode;
};

const Pagination = memo(
  ({
    table,
    pageIndex,
    pageCount,
    refetch,
    pageSize,
    selectedRowIds,
    multiSelectionSlot
  }: TPaginationProps) => {
    const onRefresh = useCallback(async () => {
      if (!refetch) return;

      await refetch();
      table.firstPage();
    }, [refetch, table]);

    return (
      <div className="flex items-center gap-2 h-full self-start">
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
        <div className="flex items-center gap-1">
          <span>Page</span>
          <strong>{pageIndex}</strong>
          <span>of</span>
          <strong>{pageCount}</strong>
        </div>

        {refetch && (
          <Button variant="outline" size="icon" onClick={onRefresh}>
            <RefreshCcw />
          </Button>
        )}

        <PerPage
          perPage={pageSize}
          setPerPage={(perPage) => table.setPageSize(perPage)}
        />

        {multiSelectionSlot && (
          <div className="flex items-center gap-2">
            {multiSelectionSlot(selectedRowIds ?? [])}
          </div>
        )}
      </div>
    );
  }
);

export { Pagination };
