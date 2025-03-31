import { memo } from 'react';

type TIOHelpProps = {
  verb: 'read' | 'write';
};

const IOHelp = memo(({ verb }: TIOHelpProps) => {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs">
        <span className="font-bold">Public:</span> anyone can {verb} files
      </span>
      <span className="text-xs">
        <span className="font-bold">Private:</span> only authenticated and
        specific authorized users can {verb} files
      </span>
      <span className="text-xs">
        <span className="font-bold">Custom:</span> you can define a custom
        javascript function to check if a user can {verb} a file
      </span>
    </div>
  );
});

const QuotaHelp = memo(() => {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs">
        <span className="font-bold">Unlimited:</span> no limit on the disk space
        a bucket can use
      </span>
      <span className="text-xs">
        <span className="font-bold">Limited:</span> limit the disk space a
        bucket can use to a certain amount
      </span>
    </div>
  );
});

export { IOHelp, QuotaHelp };
