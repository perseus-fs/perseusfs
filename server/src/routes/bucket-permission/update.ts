import type { TBucketPermission } from '@perseusfs/shared';
import { BucketPermission } from '../../database/models/bucket-permission';
import type { TCustomRequest, TErr, TRes } from '../../types';

type TUpdateBucketPermissionBody = Partial<TBucketPermission>;

const updateBucketPermission = async (
  req: TCustomRequest,
  res: TRes,
  err: TErr
) => {
  const { bucketPermissionId } = req.params;
  const body = (await req.json()) as TUpdateBucketPermissionBody;

  const bucketPermission = BucketPermission.findById(+bucketPermissionId);

  if (!bucketPermission) {
    return err({ error: 'Not found' }, 404);
  }

  const { managePermission } =
    req.user?.getBucketPermissions(bucketPermission.bucketId) ?? {};

  if (!managePermission) {
    return err({ error: 'Forbidden' }, 403);
  }

  const [success, errors] = BucketPermission.update(+bucketPermissionId, {
    permission: body.permission
  });

  if (!success) {
    return err(errors);
  }

  return res({ success: true });
};

export { updateBucketPermission };
