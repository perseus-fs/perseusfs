import { TBucket } from '@perseusfs/shared';
import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router';

const useSelectFirstBucket = (buckets: TBucket[]) => {
  const navigate = useNavigate();
  const location = useLocation();
  const hasNavigated = useRef(false);

  console.log('! location', location);

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
