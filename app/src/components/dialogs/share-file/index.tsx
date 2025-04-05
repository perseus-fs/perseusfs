import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Group } from '@/components/ui/group';
import { Input } from '@/components/ui/input';
import { Tooltip } from '@/components/ui/tooltip';
import { getApiUrl } from '@/helpers/get-api-url';
import { getFileUrl } from '@/helpers/get-file-url';
import { useToken } from '@/hooks/use-token';
import { DATE_FORMAT } from '@/statics';
import { IOPermission, TBucket, TFile } from '@perseusfs/shared';
import { format } from 'date-fns';
import { Copy } from 'lucide-react';
import { memo, useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { TDialogProps } from '..';

type TDaysPickerProps = {
  onChange: (expiresIn: number) => void;
};

const DaysPicker = memo(({ onChange }: TDaysPickerProps) => {
  const [state, setState] = useState({
    days: 0,
    hours: 1,
    minutes: 0
  });

  const onChangeHandler = useCallback(
    (event) => {
      const { name, value } = event.target;

      const intValue = parseInt(value, 10);
      if (isNaN(intValue)) {
        return;
      }

      setState((prevState) => {
        const updatedState = {
          ...prevState,
          [name]: intValue
        };

        // Corrected totalSeconds calculation using updatedState
        const totalSeconds =
          updatedState.days * 24 * 60 * 60 +
          updatedState.hours * 60 * 60 +
          updatedState.minutes * 60;

        onChange(totalSeconds);

        return updatedState;
      });
    },
    [onChange]
  );

  return (
    <div className="flex justify-evenly items-center gap-2">
      <Group label="Days">
        <Input
          type="number"
          className="w-20 text-center"
          min={0}
          max={30}
          step={1}
          placeholder="1"
          name="days"
          onChange={onChangeHandler}
          value={state.days}
        />
      </Group>

      <Group label="Hours">
        <Input
          type="number"
          className="w-20 text-center"
          min={0}
          max={24}
          step={1}
          placeholder="1"
          name="hours"
          onChange={onChangeHandler}
          value={state.hours}
        />
      </Group>

      <Group label="Minutes">
        <Input
          type="number"
          className="w-20 text-center"
          min={0}
          max={240}
          step={1}
          placeholder="1"
          name="minutes"
          onChange={onChangeHandler}
          value={state.minutes}
        />
      </Group>
    </div>
  );
});

type TShareFileDialogProps = {
  file: TFile;
  bucket: TBucket;
} & TDialogProps;

const ShareFileDialog = memo(
  ({ file, bucket, ...dialogProps }: TShareFileDialogProps) => {
    const token = useToken();
    const [expiresIn, setExpiresIn] = useState(3600); // Default to 1 hour (3600 seconds)
    const [loading, setLoading] = useState(false);
    const [url, setUrl] = useState('');

    const onGenerateLinkClick = useCallback(async () => {
      setLoading(true);

      const response = await fetch(`${getApiUrl()}/files/sign-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          bucketId: bucket.id,
          fileName: file.name,
          expiresInSeconds: expiresIn
        })
      });

      setLoading(false);

      if (!response.ok) {
        toast.error('Failed to generate signed URL!');
        return;
      }

      const { signedUrl } = await response.json();

      setUrl(`${getApiUrl()}${signedUrl}`);
    }, [bucket.id, file.name, expiresIn, token]);

    const onGenerateDirectLinkClick = useCallback(() => {
      setUrl(getFileUrl(bucket.name, file.name, file.path));
    }, [file.name, file.path, bucket.name]);

    const onInputClick = useCallback(
      (event) => {
        if (!url) return;

        const input = event.target as HTMLInputElement;
        input.select();
        input.setSelectionRange(0, input.value.length);
      },
      [url]
    );

    const onCopyClick = useCallback(() => {
      if (!url) return;

      navigator.clipboard.writeText(url);
      toast.info('URL copied to clipboard!');
    }, [url]);

    const canGenerateDirectLink = useMemo(
      () =>
        bucket.read === IOPermission.PUBLIC ||
        bucket.read === IOPermission.CUSTOM,
      [bucket.read]
    );

    return (
      <Dialog {...dialogProps}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share File</DialogTitle>
            <div className="flex flex-col gap-2 mt-2">
              <span className="text-sm text-muted-foreground">
                A signed URL is a URL that has been authorized to access a
                specific resource. It contains a token that grants temporary
                access to the resource, allowing users to download or view it
                without needing to authenticate. If the bucket is public, you
                can also generate a direct link.
              </span>

              <DaysPicker onChange={setExpiresIn} />

              <div className="flex justify-center items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Signed URL will be valid until:
                </span>
                <span className="text-sm">
                  {format(new Date(Date.now() + expiresIn * 1000), DATE_FORMAT)}
                </span>
              </div>

              <div className="flex gap-2 items-center">
                <Input
                  readOnly
                  className="w-full"
                  placeholder="URL will be generated here"
                  value={url}
                  onClick={onInputClick}
                />

                <Tooltip content="Copy URL">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={onCopyClick}
                    disabled={!url}
                  >
                    <Copy size="0.8rem" />
                  </Button>
                </Tooltip>
              </div>

              {!canGenerateDirectLink && (
                <span className="text-sm text-muted-foreground">
                  This bucket is not public so you cannot generate a direct
                  link.
                </span>
              )}

              {canGenerateDirectLink && bucket.read === IOPermission.CUSTOM && (
                <span className="text-sm text-muted-foreground">
                  This bucket has a custom read permission. Depending on the
                  permission, you may not be able to access the file using the
                  direct link.
                </span>
              )}
            </div>
          </DialogHeader>
          <DialogFooter>
            {canGenerateDirectLink && (
              <Button
                onClick={onGenerateDirectLinkClick}
                disabled={!canGenerateDirectLink}
              >
                Generate Direct Link
              </Button>
            )}

            <Button onClick={onGenerateLinkClick} disabled={loading}>
              Generate Signed URL
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
);

export { ShareFileDialog };
