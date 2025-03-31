import { getApiUrl } from '@/helpers/get-api-url';
import { DEFAULT_QUERY_CACHE } from '@/statics';
import { useQuery } from '@tanstack/react-query';
import { useToken } from './use-token';

const fetchBucketPermission = async (
  permissionId: number | undefined,
  token: string | undefined
) => {
  if (!permissionId || !token)
    throw new Error('Invalid permission ID or token');

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

  if (!response.ok) {
    throw new Error('Failed to fetch bucket permission');
  }

  const data = await response.json();
  return data.bucketPermission ?? undefined;
};

const useBucketPermission = (permissionId: number | undefined) => {
  const token = useToken();

  const {
    data: userPermission,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['bucket-permission', permissionId],
    queryFn: () => fetchBucketPermission(permissionId, token),
    enabled: !!permissionId && !!token,
    staleTime: DEFAULT_QUERY_CACHE
  });

  return { loading: isLoading, userPermission, isError, refetch };
};

export { useBucketPermission };
