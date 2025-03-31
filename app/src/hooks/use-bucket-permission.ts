import { getApiUrl } from '@/helpers/get-api-url';
import { TBucketPermission } from '@perseusfs/shared';
import { useCallback, useEffect, useState } from 'react';
import { useToken } from './use-token';

const useBucketPermission = (permissionId: number | undefined) => {
  const [userPermission, setUserPermission] = useState<
    TBucketPermission | undefined
  >();
  const [loading, setLoading] = useState(false);
  const token = useToken();

  const loadBuckets = useCallback(async () => {
    if (!permissionId) return;

    setLoading(true);

    const response = await fetch(
      `${getApiUrl()}/bucket_permissions/${permissionId}`,
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

    setUserPermission(data.bucketPermission ?? undefined);
  }, [token, permissionId]);

  useEffect(() => {
    loadBuckets();
  }, [loadBuckets]);

  return { loading, userPermission, refetch: loadBuckets };
};

export { useBucketPermission };
