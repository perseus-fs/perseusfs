import { getApiUrl } from '@/helpers/get-api-url';
import { DEFAULT_QUERY_CACHE } from '@/statics';
import { useQuery } from '@tanstack/react-query';
import { useToken } from './use-token';

const fetchBucketPermissions = async (
  bucketId: number | undefined,
  token: string | undefined
) => {
  if (!bucketId || !token) throw new Error('Invalid bucket ID or token');

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

  if (!response.ok) {
    throw new Error('Failed to fetch bucket permissions');
  }

  const data = await response.json();
  return data.permissions ?? [];
};

const useBucketPermissions = (bucketId: number | undefined) => {
  const token = useToken();

  const {
    data: bucketPermissions = [],
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['bucket-permissions', bucketId],
    queryFn: () => fetchBucketPermissions(bucketId, token),
    enabled: !!bucketId && !!token,
    staleTime: DEFAULT_QUERY_CACHE
  });

  return { loading: isLoading, bucketPermissions, isError, refetch };
};

export { useBucketPermissions };
