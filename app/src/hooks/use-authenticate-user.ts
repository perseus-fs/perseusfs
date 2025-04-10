import { setDemoMode } from '@/actions/app';
import { doLogout, setUser } from '@/actions/user';
import { getApiUrl } from '@/helpers/get-api-url';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useToken } from './use-token';

const useAuthenticateUser = () => {
  const token = useToken();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  const authenticate = useCallback(async () => {
    setLoading(true);

    const response = await fetch(`${getApiUrl()}/users/auth`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      toast.error('Failed to authenticate user. You have been logged out.');
      doLogout();

      return;
    }

    const { user, demoMode } = await response.json();

    if (!user) return;

    setUser(user);
    setAuthenticated(true);
    setDemoMode(demoMode ?? false);
  }, [token]);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    authenticate().finally(() => setLoading(false));
  }, [authenticate, token]);

  return { loading, authenticated };
};

export { useAuthenticateUser };
