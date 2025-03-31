import { getApiUrl } from '@/helpers/get-api-url';
import { DEFAULT_QUERY_CACHE } from '@/statics';
import { useQuery } from '@tanstack/react-query';
import { useToken } from './use-token';

const fetchBuckets = async (token: string | undefined) => {
  if (!token) throw new Error('No token provided');

  const response = await fetch(`${getApiUrl()}/buckets`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch buckets');
  }

  const data = await response.json();
  return data.buckets;
};

const useBuckets = () => {
  const token = useToken();

  const {
    data: buckets = [],
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['buckets'],
    queryFn: () => fetchBuckets(token),
    enabled: !!token,
    staleTime: DEFAULT_QUERY_CACHE
  });

  return { loading: isLoading, buckets, isError, refetch };
};

export { useBuckets };
