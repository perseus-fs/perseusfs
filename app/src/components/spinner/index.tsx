import { cn } from '@/lib/utils';
import { LoaderCircleIcon } from 'lucide-react';
import { forwardRef, memo } from 'react';

type TLoadingSpinner = {
  size?: string;
  className?: string;
};

const Spinner = memo(
  forwardRef<SVGSVGElement, TLoadingSpinner>(
    ({ size = '1rem', className }, ref) => {
      return (
        <LoaderCircleIcon
          ref={ref}
          size={size}
          className={cn(className, 'animate-spin')}
        />
      );
    }
  )
);

export { Spinner };
