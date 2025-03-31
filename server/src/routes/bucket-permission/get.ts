import { BucketPermission } from '../../database/models/bucket-permission';
import type { TCustomRequest, TRes } from '../../types';

const getBucketPermission = async (req: TCustomRequest, res: TRes) => {
  const { bucketPermissionId } = req.params;
  const bucketPermission = BucketPermission.findById(+bucketPermissionId);

  if (!bucketPermission) {
    return res({ error: 'Not found' }, 404);
  }

  return res({ bucketPermission });
};

export { getBucketPermission };
