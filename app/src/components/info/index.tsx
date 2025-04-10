import { useIsDemoModeEnabled } from '@/hooks/use-is-demo-mode-enabled';
import { memo } from 'react';

const Info = memo(() => {
  const demoMode = useIsDemoModeEnabled();

  return (
    <div className="flex flex-col">
      {demoMode && (
        <span className="text-xs text-center font-bold text-red-200 uppercase">
          Demo mode
        </span>
      )}

      <div className="flex gap-2 items-center justify-center mt-2">
        <span className="text-xs text-primary/60">
          v{import.meta.env.PACKAGE_VERSION}
        </span>
        <a
          href="https://github.com/diogomartino/perseusfs"
          target="_blank"
          className="hover:underline"
        >
          <span className="text-xs text-primary/60">Github</span>
        </a>
      </div>
    </div>
  );
});

export { Info };
