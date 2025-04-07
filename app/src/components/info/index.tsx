import { memo } from 'react';

const Info = memo(() => {
  return (
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
  );
});

export { Info };
