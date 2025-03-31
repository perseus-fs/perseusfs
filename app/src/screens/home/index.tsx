import { useBuckets } from '@/hooks/use-buckets';
import { memo } from 'react';

const Home = memo(() => {
  const { buckets } = useBuckets();

  return (
    <h1>
      Home
      <pre>{JSON.stringify(buckets, null, 2)}</pre>
    </h1>
  );
});

export { Home };
