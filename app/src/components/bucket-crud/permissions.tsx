import { openDialog, requestConfirmation } from '@/actions/dialog';
import { getApiUrl } from '@/helpers/get-api-url';
import { useBucketPermissions } from '@/hooks/use-bucket-permissions';
import { useToken } from '@/hooks/use-token';
import {
  BUCKET_PERMISSION_DICTIONARY,
  TBucketPermission
} from '@perseusfs/shared';
import { Pencil, Trash } from 'lucide-react';
import { memo, useCallback } from 'react';
import { toast } from 'sonner';
import { Dialog } from '../dialogs';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tooltip } from '../ui/tooltip';

type TPermissionProps = {
  permission: TBucketPermission;
  refetch: () => void;
};

const Permission = memo(({ permission, refetch }: TPermissionProps) => {
  const token = useToken();

  const onDeletePermissionClick = useCallback(async () => {
    const result = await requestConfirmation({
      title: 'Delete permission',
      message: `Are you sure you want to delete permission ${permission.id}?`,
      confirmLabel: 'Delete'
    });

    if (!result) return;

    const response = await fetch(
      `${getApiUrl()}/bucket_permissions/${permission.id}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      toast.error('Failed to delete permission.');
      return;
    }

    toast.success('Permission deleted successfully.');
    refetch();
  }, [permission.id, token, refetch]);

  const onEditPermissionClick = useCallback(() => {
    openDialog(Dialog.CREATE_PERMISSION, {
      permissionId: permission.id,
      refetch,
      existingUserIds: [],
      disableUser: true
    });
  }, [permission.id, refetch]);

  return (
    <div className="flex items-center justify-between p-2 border border-border rounded-lg">
      <div className="flex gap-4 items-center">
        <span className="text-sm">{permission._user?.name}</span>
        <Badge variant="outline">
          {BUCKET_PERMISSION_DICTIONARY[permission.permission]}
        </Badge>
      </div>
      <div>
        <Tooltip content="Edit permission">
          <Button size="icon" variant="ghost" onClick={onEditPermissionClick}>
            <Pencil size="1rem" />
          </Button>
        </Tooltip>
        <Tooltip content="Delete permission">
          <Button size="icon" variant="ghost" onClick={onDeletePermissionClick}>
            <Trash size="1rem" />
          </Button>
        </Tooltip>
      </div>
    </div>
  );
});

type TBucketPermissionsProps = {
  bucketId: number | undefined;
};

const BucketPermissions = memo(({ bucketId }: TBucketPermissionsProps) => {
  const { bucketPermissions, refetch } = useBucketPermissions(bucketId);

  const onAddPermissionClick = useCallback(() => {
    openDialog(Dialog.CREATE_PERMISSION, {
      bucketId,
      refetch,
      existingUserIds: bucketPermissions.map((permission) => permission.userId)
    });
  }, [bucketId, refetch, bucketPermissions]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2">
        {bucketPermissions.map((permission) => (
          <Permission
            key={permission.id}
            permission={permission}
            refetch={refetch}
          />
        ))}
      </div>

      <Button onClick={onAddPermissionClick}>Add new permission</Button>
    </div>
  );
});

export { BucketPermissions };
