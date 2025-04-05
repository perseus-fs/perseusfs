import { closeDialog } from '@/actions/dialog';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Group } from '@/components/ui/group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { UserPicker } from '@/components/user-picker';
import { getApiUrl } from '@/helpers/get-api-url';
import { useBucketPermission } from '@/hooks/use-bucket-permission';
import { useForm } from '@/hooks/use-form';
import { useToken } from '@/hooks/use-token';
import { BucketPermission, TZedBucketPermission } from '@perseusfs/shared';
import { memo, useCallback, useMemo, useState } from 'react';
import { TDialogProps } from '..';

const DEFAULT_VALUES: Partial<TZedBucketPermission> = {
  userId: -1,
  permission: BucketPermission.READ
};

type TCreatePermissionDialogProps = {
  bucketId: number;
  permissionId?: number;
  refetch: () => void;
  existingUserIds: number[];
  disableUser?: boolean;
} & TDialogProps;

const CreatePermissionDialog = memo(
  ({
    bucketId,
    refetch,
    existingUserIds,
    permissionId,
    disableUser = false,
    ...dialogProps
  }: TCreatePermissionDialogProps) => {
    const token = useToken();
    const { userPermission } = useBucketPermission(permissionId);
    const { rs, errors, values, setErrors } = useForm(
      userPermission ?? DEFAULT_VALUES
    );
    const [loading, setLoading] = useState(false);
    const isUpdate = useMemo(() => !!permissionId, [permissionId]);

    const onAddPermissionClick = useCallback(async () => {
      setLoading(true);

      const response = await fetch(`${getApiUrl()}/bucket_permissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...values,
          bucketId
        })
      });

      if (!response.ok) {
        const { errors } = await response.json();

        setErrors(errors);
      } else {
        refetch();
        closeDialog();
      }

      setLoading(false);
    }, [bucketId, values, token, setErrors, refetch]);

    const onUpdatePermissionClick = useCallback(async () => {
      setLoading(true);

      const response = await fetch(
        `${getApiUrl()}/bucket_permissions/${permissionId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(values)
        }
      );

      if (!response.ok) {
        const { errors } = await response.json();

        setErrors(errors);
      } else {
        refetch();
        closeDialog();
      }

      setLoading(false);
    }, [permissionId, values, token, setErrors, refetch]);

    return (
      <Dialog {...dialogProps}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isUpdate ? 'Edit' : 'Add'} permission</DialogTitle>
            <div className="flex flex-col gap-2 mt-2">
              <Group label="User" required error={errors.userId}>
                <UserPicker
                  {...rs('userId', true)}
                  blacklist={existingUserIds}
                  disabled={disableUser}
                />
              </Group>

              <Group label="Permission" required error={errors.permission}>
                <Select
                  {...rs('permission')}
                  defaultValue={BucketPermission.READ}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select permission" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={BucketPermission.OWNER}>
                      Owner
                    </SelectItem>
                    <SelectItem value={BucketPermission.READ}>Read</SelectItem>
                    <SelectItem value={BucketPermission.WRITE}>
                      Write
                    </SelectItem>
                    <SelectItem value={BucketPermission.READ_WRITE}>
                      Read & Write
                    </SelectItem>
                  </SelectContent>
                </Select>
              </Group>
            </div>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={
                isUpdate ? onUpdatePermissionClick : onAddPermissionClick
              }
              disabled={loading}
            >
              {isUpdate ? 'Update' : 'Add'} permission
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
);

export { CreatePermissionDialog };
