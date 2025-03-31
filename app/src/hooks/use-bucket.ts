import { getApiUrl } from '@/helpers/get-api-url';
import { DEFAULT_QUERY_CACHE } from '@/statics';
import { DEFAULT_USER_PERMISSIONS } from '@perseusfs/shared';
import { useQuery } from '@tanstack/react-query';
import { useToken } from './use-token';

const fetchBucket = async (
  bucketId: number | undefined,
  token: string | undefined
) => {
  if (!bucketId || !token) throw new Error('Invalid bucket ID or token');

  const response = await fetch(`${getApiUrl()}/buckets/${bucketId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch bucket');
  }

  const data = await response.json();

  return {
    files: data.files ?? [],
    bucket: data.bucket ?? undefined,
    userPermissions: data.userPermissions ?? DEFAULT_USER_PERMISSIONS
  };
};

const useBucket = (bucketId: number | undefined) => {
  const token = useToken();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['bucket', bucketId],
    queryFn: () => fetchBucket(bucketId, token),
    enabled: !!bucketId && !!token,
    staleTime: DEFAULT_QUERY_CACHE
  });

  return {
    loading: isLoading,
    files: data?.files ?? [],
    bucket: data?.bucket ?? undefined,
    userPermissions: data?.userPermissions ?? DEFAULT_USER_PERMISSIONS,
    isError,
    refetch
  };
};

export { useBucket };
