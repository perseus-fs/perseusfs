import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useBuckets } from './use-buckets';

const useSelectFirstBucket = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const hasNavigated = useRef(false);
  const { buckets } = useBuckets();

  useEffect(() => {
    if (
      hasNavigated.current ||
      buckets.length === 0 ||
      location.pathname !== '/'
    )
      return;

    navigate(`/bucket/${buckets[0].id}`);
    hasNavigated.current = true;
  }, [buckets, navigate, location.pathname]);

  return null;
};

export { useSelectFirstBucket };
