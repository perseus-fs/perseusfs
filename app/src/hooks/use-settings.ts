import { getApiUrl } from '@/helpers/get-api-url';
import { DEFAULT_QUERY_CACHE } from '@/statics';
import { useQuery } from '@tanstack/react-query';
import { useToken } from './use-token';

const fetchSettings = async (token: string | undefined) => {
  if (!token) throw new Error('No token provided');

  const response = await fetch(`${getApiUrl()}/settings`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch settings');
  }

  const { settings } = await response.json();
  return settings;
};

const useSettings = () => {
  const token = useToken();

  const {
    data: settings,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['settings'],
    queryFn: () => fetchSettings(token),
    enabled: !!token,
    staleTime: DEFAULT_QUERY_CACHE
  });

  return { loading: isLoading, settings, isError, refetch };
};

export { useSettings };
