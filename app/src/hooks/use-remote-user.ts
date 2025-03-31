import { getApiUrl } from '@/helpers/get-api-url';
import { DEFAULT_QUERY_CACHE } from '@/statics';
import { useQuery } from '@tanstack/react-query';
import { useToken } from './use-token';

const fetchUser = async (
  userId: number | undefined,
  token: string | undefined
) => {
  if (!userId || !token) throw new Error('Invalid user ID or token');

  const response = await fetch(`${getApiUrl()}/users/${userId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user');
  }

  const data = await response.json();
  return data.user;
};

const useRemoteUser = (userId: number | undefined) => {
  const token = useToken();

  const {
    data: user,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId, token),
    enabled: !!userId && !!token,
    staleTime: DEFAULT_QUERY_CACHE
  });

  return { loading: isLoading, user, isError, refetch };
};

export { useRemoteUser };
