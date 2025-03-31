import { updateSidebar } from '@/actions/app';
import { BucketCrud } from '@/components/bucket-crud';
import { getApiUrl } from '@/helpers/get-api-url';
import { useToken } from '@/hooks/use-token';
import { TErrors, TZedBucket } from '@perseusfs/shared';
import { memo, useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { toast } from 'sonner';

const UpdateBucket = memo(() => {
  const [loading, setLoading] = useState(false);
  const { id } = useParams<{
    id: string;
  }>();

  const bucketId = useMemo(() => {
    if (!id || isNaN(Number(id))) {
      return undefined;
    }
    return Number(id);
  }, [id]);

  const token = useToken();

  const onSubmit = useCallback(
    async (values: Partial<TZedBucket>): Promise<TErrors | undefined> => {
      setLoading(true);

      const res = await fetch(`${getApiUrl()}/buckets/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(values)
      });

      setLoading(false);

      if (!res.ok) {
        const { errors } = await res.json();

        return errors;
      }

      updateSidebar();
      toast.success('Bucket updated successfully');
    },
    [token, id]
  );

  return (
    <BucketCrud bucketId={bucketId} onSubmit={onSubmit} loading={loading} />
  );
});

export { UpdateBucket };
