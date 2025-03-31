import { getApiUrl } from '@/helpers/get-api-url';
import {
  DEFAULT_USER_PERMISSIONS,
  TUserBucketPermissions
} from '@perseusfs/shared';
import { useCallback, useEffect, useState } from 'react';
import { useToken } from './use-token';

const useBucket = (bucketId: number | undefined) => {
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<any[]>([]);
  const [bucket, setBucket] = useState<any>(undefined);
  const [userPermissions, setUserPermissions] =
    useState<TUserBucketPermissions>(DEFAULT_USER_PERMISSIONS);
  const token = useToken();

  const loadBucket = useCallback(async () => {
    if (!bucketId) return;

    setLoading(true);

    const response = await fetch(`${getApiUrl()}/buckets/${bucketId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });

    setLoading(false);

    if (!response.ok) return;

    const data = await response.json();

    setFiles(data.files ?? []);
    setBucket(data.bucket ?? undefined);
    setUserPermissions(data.userPermissions ?? DEFAULT_USER_PERMISSIONS);
  }, [token, bucketId]);

  useEffect(() => {
    loadBucket();
  }, [loadBucket]);

  return { loading, files, bucket, userPermissions, refetch: loadBucket };
};

export { useBucket };
