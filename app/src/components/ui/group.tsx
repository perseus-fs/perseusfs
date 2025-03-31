import { Info } from 'lucide-react';
import { memo } from 'react';
import { Tooltip } from './tooltip';

type TGroupProps = {
  label?: string;
  children: React.ReactNode;
  error?: string;
  description?: string;
  required?: boolean;
  className?: string;
  help?: React.ReactNode;
};

const Group = memo(
  ({
    children,
    label,
    error,
    description,
    required,
    className,
    help
  }: TGroupProps) => {
    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1">
          <span className="text-sm">
            {label}
            {required && <span className="text-red-400 ml-1">*</span>}
          </span>
          {help && (
            <Tooltip content={help}>
              <Info size="0.7rem" />
            </Tooltip>
          )}
        </div>
        {description && (
          <span className="text-xs text-primary/60">{description}</span>
        )}
        <div className={className}>{children}</div>
        {error && <span className="text-xs text-red-400">{error}</span>}
      </div>
    );
  }
);

export { Group };
