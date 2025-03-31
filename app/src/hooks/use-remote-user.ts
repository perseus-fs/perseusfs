import { getApiUrl } from '@/helpers/get-api-url';
import { TUser } from '@perseusfs/shared';
import { useCallback, useEffect, useState } from 'react';
import { useToken } from './use-token';

const useRemoteUser = (userId: number | undefined) => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<TUser | undefined>(undefined);
  const token = useToken();

  const loadUser = useCallback(async () => {
    if (!userId) return;

    setLoading(true);

    const response = await fetch(`${getApiUrl()}/users/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });

    setLoading(false);

    if (!response.ok) return;

    const data = await response.json();

    setUser(data.user);
  }, [token, userId]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return { loading, user, refetch: loadUser };
};

export { useRemoteUser };
