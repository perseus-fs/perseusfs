import { invalidateBucket } from '@/actions/app';
import { openDialog, requestConfirmation } from '@/actions/dialog';
import { Dialog } from '@/components/dialogs';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';
import { formatSeconds } from '@/helpers/format-seconds';
import { getApiUrl } from '@/helpers/get-api-url';
import { useToken } from '@/hooks/use-token';
import {
  QuotaPolicy,
  RetentionPolicy,
  TBucket,
  TFile,
  TUserBucketPermissions
} from '@perseusfs/shared';
import { filesize } from 'filesize';
import { upperFirst } from 'lodash';
import { FileUp, FolderCog, RefreshCcw, Trash } from 'lucide-react';
import { memo, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

type TItemProps = {
  label: string;
  value: string;
};

const Item = memo(({ label, value }: TItemProps) => {
  return (
    <div className="flex gap-1">
      <span>{label}:</span>
      <span className="font-bold">{value}</span>
    </div>
  );
});

type THeaderProps = {
  bucket: TBucket;
  files: TFile[];
  refetch: () => void;
  userPermissions: TUserBucketPermissions;
};

const Header = memo(
  ({ bucket, userPermissions, files, refetch }: THeaderProps) => {
    const token = useToken();
    const navigate = useNavigate();

    const onEditClick = useCallback(() => {
      navigate(`/bucket/${bucket.id}/edit`);
    }, [bucket.id, navigate]);

    const filesSize = useMemo(
      () => files.reduce((acc, file) => acc + file.size, 0),
      [files]
    );

    const onUploadClick = useCallback(() => {
      openDialog(Dialog.UPLOAD_FILES, {
        onUploadSuccess: refetch,
        bucketId: bucket.id
      });
    }, [bucket.id, refetch]);

    const onDeleteClick = useCallback(async () => {
      const result = await requestConfirmation({
        title: `Deleting ${bucket.name}`,
        message: `Are you sure you want to delete this bucket? All files within this bucket will be deleted. This action is irreversible.`,
        confirmLabel: 'Delete'
      });

      if (!result) return;

      const response = await fetch(`${getApiUrl()}/buckets/${bucket.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        toast.error('Error deleting bucket');
        return;
      }

      navigate('/');
      invalidateBucket(bucket.id);
    }, [bucket.name, bucket.id, token, navigate]);

    return (
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="text-3xl font-bold">{bucket?.name}</span>
          <Tooltip content="Refresh">
            <Button size="icon" variant="ghost" onClick={refetch}>
              <RefreshCcw size="1rem" />
            </Button>
          </Tooltip>
          {userPermissions.writePermission && (
            <Tooltip content="Upload files">
              <Button size="icon" variant="ghost" onClick={onUploadClick}>
                <FileUp size="1rem" />
              </Button>
            </Tooltip>
          )}
          {userPermissions.managePermission && (
            <>
              <Tooltip content="Edit bucket">
                <Button size="icon" variant="ghost" onClick={onEditClick}>
                  <FolderCog size="1rem" />
                </Button>
              </Tooltip>
              <Tooltip content="Delete bucket">
                <Button size="icon" variant="ghost" onClick={onDeleteClick}>
                  <Trash size="1rem" />
                </Button>
              </Tooltip>
            </>
          )}
        </div>
        <div className="flex gap-4 items-center">
          <Item label="Read" value={upperFirst(bucket.read)} />
          <Item label="Write" value={upperFirst(bucket.write)} />
          <Item
            label="Files"
            value={`${files.length} (${filesize(filesSize)})`}
          />
          <Item
            label="Quota"
            value={
              bucket.quotaPolicy === QuotaPolicy.LIMITED
                ? `${filesize(bucket.quota ?? 0)}`
                : 'Unlimited'
            }
          />
          <Item
            label="Retention"
            value={
              bucket.retentionPolicy === RetentionPolicy.DISPOSE
                ? `Keep files for ${formatSeconds(bucket.retention ?? 0)}`
                : 'Keep files forever'
            }
          />
        </div>
      </div>
    );
  }
);

export { Header };
