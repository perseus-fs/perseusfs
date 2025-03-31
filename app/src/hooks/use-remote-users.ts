import { getApiUrl } from '@/helpers/get-api-url';
import { DEFAULT_QUERY_CACHE } from '@/statics';
import { useQuery } from '@tanstack/react-query';
import { useToken } from './use-token';

const fetchUsers = async (token: string | undefined) => {
  if (!token) throw new Error('No token provided');

  const response = await fetch(`${getApiUrl()}/users`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }

  const data = await response.json();
  return data.users ?? [];
};

const useRemoteUsers = () => {
  const token = useToken();

  const {
    data: users = [],
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['users'],
    queryFn: () => fetchUsers(token),
    enabled: !!token,
    staleTime: DEFAULT_QUERY_CACHE
  });

  return { loading: isLoading, users, isError, refetch };
};

export { useRemoteUsers };
