import { getApiUrl } from '@/helpers/get-api-url';
import { TUser } from '@perseusfs/shared';
import { useCallback, useEffect, useState } from 'react';
import { useToken } from './use-token';

const useRemoteUsers = () => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<TUser[]>([]);
  const token = useToken();

  const loadUsers = useCallback(async () => {
    setLoading(true);

    const response = await fetch(`${getApiUrl()}/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });

    setLoading(false);

    if (!response.ok) {
      return;
    }

    const data = await response.json();

    setUsers(data.users);
  }, [token]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  return { loading, users, refetch: loadUsers };
};

export { useRemoteUsers };
