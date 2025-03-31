import { updateSidebar } from '@/actions/app';
import { openDialog, requestConfirmation } from '@/actions/dialog';
import { Dialog } from '@/components/dialogs';
import { LoadingSection } from '@/components/loading-section';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';
import { getApiUrl } from '@/helpers/get-api-url';
import { useBucket } from '@/hooks/use-bucket';
import { useToken } from '@/hooks/use-token';
import { TBucket, TFile, TUserBucketPermissions } from '@perseusfs/shared';
import { filesize } from 'filesize';
import { FileUp, FolderCog, RefreshCcw, Trash } from 'lucide-react';
import { memo, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import { FilesTable } from './table';

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

      if (response.ok) {
        navigate('/');
        updateSidebar();
      }
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
          <span>
            Read: <span className="font-bold">{bucket.read.toUpperCase()}</span>
          </span>
          <span>
            Write:{' '}
            <span className="font-bold">{bucket.write.toUpperCase()}</span>
          </span>
          <span>
            Files:{' '}
            <span className="font-bold">
              {files.length} ({filesize(filesSize)})
            </span>
          </span>
        </div>
      </div>
    );
  }
);

const Bucket = memo(() => {
  const { id } = useParams<{
    id: string;
  }>();

  const { files, bucket, loading, userPermissions, refetch } = useBucket(
    +(id || 0)
  );

  if (loading) {
    return <LoadingSection />;
  }

  if (!bucket) {
    return <div>Bucket not found</div>;
  }

  return (
    <div className="flex flex-col w-full gap-2">
      <Header
        bucket={bucket}
        files={files}
        refetch={refetch}
        userPermissions={userPermissions}
      />
      <FilesTable bucket={bucket} files={files} refetch={refetch} />
    </div>
  );
});

export { Bucket };
