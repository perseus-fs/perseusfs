import { getApiUrl } from '@/helpers/get-api-url';
import { TMetrics } from '@perseusfs/shared';
import { useCallback, useEffect, useState } from 'react';
import { useToken } from './use-token';

const useMetrics = () => {
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<TMetrics | undefined>();
  const [loadedFirstTime, setLoadedFirstTime] = useState(false);
  const token = useToken();

  const loadMetrics = useCallback(async () => {
    setLoading(true);

    const response = await fetch(`${getApiUrl()}/metrics`, {
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

    const { metrics } = await response.json();

    setMetrics(metrics);
    setLoadedFirstTime(true);
  }, [token]);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  return { loading, metrics, refetch: loadMetrics, loadedFirstTime };
};

export { useMetrics };
