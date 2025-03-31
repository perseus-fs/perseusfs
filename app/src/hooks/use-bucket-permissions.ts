import { getApiUrl } from '@/helpers/get-api-url';
import { TBucketPermission } from '@perseusfs/shared';
import { useCallback, useEffect, useState } from 'react';
import { useToken } from './use-token';

const useBucketPermissions = (bucketId: number | undefined) => {
  const [loading, setLoading] = useState(false);
  const [bucketPermissions, setBucketPermissions] = useState<
    TBucketPermission[]
  >([]);
  const token = useToken();

  const loadBuckets = useCallback(async () => {
    if (!bucketId) return;

    setLoading(true);

    const response = await fetch(
      `${getApiUrl()}/buckets/${bucketId}/permissions`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      }
    );

    setLoading(false);

    if (!response.ok) return;

    const data = await response.json();

    setBucketPermissions(data.permissions ?? []);
  }, [token, bucketId]);

  useEffect(() => {
    loadBuckets();
  }, [loadBuckets]);

  return { loading, bucketPermissions, refetch: loadBuckets };
};

export { useBucketPermissions };
