import { getApiUrl } from '@/helpers/get-api-url';
import { useCallback, useEffect, useState } from 'react';
import { useToken } from './use-token';

const useBuckets = () => {
  const [loading, setLoading] = useState(false);
  const [buckets, setBuckets] = useState<any[]>([]);
  const token = useToken();

  const loadBuckets = useCallback(async () => {
    setLoading(true);

    const response = await fetch(`${getApiUrl()}/buckets`, {
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

    setBuckets(data.buckets);
  }, [token]);

  useEffect(() => {
    loadBuckets();
  }, [loadBuckets]);

  return { loading, buckets, refetch: loadBuckets };
};

export { useBuckets };
