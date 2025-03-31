import { getApiUrl } from '@/helpers/get-api-url';
import { TSettings } from '@perseusfs/shared';
import { useCallback, useEffect, useState } from 'react';
import { useToken } from './use-token';

const useSettings = () => {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<TSettings | undefined>();
  const token = useToken();

  const loadSettings = useCallback(async () => {
    setLoading(true);

    const response = await fetch(`${getApiUrl()}/settings`, {
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

    const { settings } = await response.json();

    setSettings(settings);
  }, [token]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return { loading, settings, refetch: loadSettings };
};

export { useSettings };
