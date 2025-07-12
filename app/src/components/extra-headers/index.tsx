import { AlertCircle, Trash } from 'lucide-react';
import { memo, useCallback, useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Tooltip } from '../ui/tooltip';

type HeaderRow = {
  key: string;
  value: string;
};

type TRowProps = {
  objKey: string;
  value: string;
  isDuplicated: boolean;
  readOnly?: boolean;
  onRemove?: () => void;
  onChangeKey: (newKey: string) => void;
  onChangeValue: (value: string) => void;
};

const Row = memo(
  ({
    value,
    objKey,
    isDuplicated,
    readOnly = false,
    onRemove,
    onChangeKey,
    onChangeValue
  }: TRowProps) => {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 w-[500px]">
          <Input
            value={objKey}
            onChange={(e) => onChangeKey(e.target.value)}
            placeholder="Key"
            readOnly={readOnly}
          />
          <Input
            value={value}
            onChange={(e) => onChangeValue(e.target.value)}
            placeholder="Value"
            readOnly={readOnly}
          />
        </div>
        {isDuplicated && (
          <div>
            <Tooltip content="This key is duplicated and will be ignored.">
              <AlertCircle size="1rem" className="text-red-500" />
            </Tooltip>
          </div>
        )}
        <div>
          <Tooltip content="Remove header">
            <Button size="icon" variant="ghost" onClick={() => onRemove?.()}>
              <Trash size="0.9rem" />
            </Button>
          </Tooltip>
        </div>
      </div>
    );
  }
);

type TExtraHeadersProps = {
  value?: Record<string, string>;
  onChange?: (value: Record<string, string>) => void;
  readOnly?: boolean;
};

const ExtraHeaders = memo(
  ({ onChange, value, readOnly = false }: TExtraHeadersProps) => {
    const [rows, setRows] = useState<HeaderRow[]>(() => {
      if (value) {
        return Object.entries(value).map(([key, value]) => ({
          key,
          value
        }));
      }
      return [{ key: '', value: '' }];
    });

    const onAddKey = useCallback(() => {
      setRows((prev) => [...prev, { key: '', value: '' }]);
    }, []);

    const onChangeKey = useCallback((index: number, newKey: string) => {
      setRows((prev) =>
        prev.map((row, idx) => (idx === index ? { ...row, key: newKey } : row))
      );
    }, []);

    const onChangeValue = useCallback((index: number, value: string) => {
      setRows((prev) =>
        prev.map((row, idx) => (idx === index ? { ...row, value } : row))
      );
    }, []);

    const onRemoveKey = useCallback((index: number) => {
      setRows((prev) => prev.filter((_, idx) => idx !== index));
    }, []);

    useEffect(() => {
      const newValue: typeof value = rows.reduce((acc, row) => {
        if (row.key.trim() !== '') {
          acc[row.key] = row.value;
        }

        return acc;
      }, {});

      onChange?.(newValue);
    }, [rows, onChange]);

    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          {rows.map((row, index) => {
            const isDuplicated = row.key
              ? rows.filter((r) => r.key === row.key).length > 1
              : false;

            return (
              <Row
                key={index} // #yolo
                objKey={row.key}
                value={row.value}
                onRemove={() => onRemoveKey(index)}
                onChangeKey={(newKey) => onChangeKey(index, newKey)}
                onChangeValue={(value) => onChangeValue(index, value)}
                isDuplicated={isDuplicated}
                readOnly={readOnly}
              />
            );
          })}
        </div>

        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={onAddKey}
            disabled={readOnly}
          >
            Add header
          </Button>
        </div>
      </div>
    );
  }
);

export { ExtraHeaders };
