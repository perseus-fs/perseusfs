import { memo } from 'react';
import { Spinner } from '../spinner';

type TLoadingSectionProps = {
  size?: string;
};

const LoadingSection = memo(({ size = '3rem' }: TLoadingSectionProps) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <Spinner size={size} />
      <span className="text-sm text-primary/60">Loading</span>
    </div>
  );
});

export { LoadingSection };
