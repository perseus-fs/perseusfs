import { getApiUrl } from '@/helpers/get-api-url';
import { TUser } from '@perseusfs/shared';
import { useCallback, useEffect, useState } from 'react';
import { useToken } from './use-token';

const useUsers = () => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<TUser[]>([]);
  const token = useToken();

  const loadBuckets = useCallback(async () => {
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
    loadBuckets();
  }, [loadBuckets]);

  return { loading, users, refetch: loadBuckets };
};

export { useUsers };
