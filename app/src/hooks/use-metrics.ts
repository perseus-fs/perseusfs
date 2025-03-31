import { getApiUrl } from '@/helpers/get-api-url';
import { useQuery } from '@tanstack/react-query';
import { useToken } from './use-token';

const fetchMetrics = async (token: string | undefined) => {
  if (!token) throw new Error('No token provided');

  const response = await fetch(`${getApiUrl()}/metrics`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch metrics');
  }

  const { metrics } = await response.json();
  return metrics;
};

const useMetrics = () => {
  const token = useToken();

  const {
    data: metrics,
    isLoading,
    isError,
    refetch,
    isFetched
  } = useQuery({
    queryKey: ['metrics'],
    queryFn: () => fetchMetrics(token),
    enabled: !!token,
    staleTime: 1
  });

  return {
    loading: isLoading,
    metrics,
    refetch,
    loadedFirstTime: isFetched,
    isError
  };
};

export { useMetrics };
