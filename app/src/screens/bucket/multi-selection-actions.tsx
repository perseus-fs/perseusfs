import { requestConfirmation } from '@/actions/dialog';
import { Button } from '@/components/ui/button';
import { getApiUrl } from '@/helpers/get-api-url';
import { useToken } from '@/hooks/use-token';
import { memo, useCallback } from 'react';
import { toast } from 'sonner';

type TMultiSelectActionsProps = {
  selectedRowIds: number[];
  refetch: () => void;
};

const MultiSelectActions = memo(
  ({ selectedRowIds, refetch }: TMultiSelectActionsProps) => {
    const token = useToken();

    const onDeleteClick = useCallback(async () => {
      const answer = await requestConfirmation({
        title: 'Delete selected items',
        message: `Are you sure you want to delete ${selectedRowIds.length} items? This action is irreversible.`,
        confirmLabel: 'Delete'
      });

      if (!answer) return;

      const response = await fetch(`${getApiUrl()}/files`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ fileIds: selectedRowIds })
      });

      if (response.ok) {
        toast.success('File deleted successfully.');
        refetch();
      } else {
        toast.error('An error occurred while deleting the file.');
      }
    }, [selectedRowIds, token, refetch]);

    if (selectedRowIds.length === 0) {
      return null;
    }

    return (
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={onDeleteClick}>
          Delete {selectedRowIds.length} items
        </Button>
      </div>
    );
  }
);

export { MultiSelectActions };
