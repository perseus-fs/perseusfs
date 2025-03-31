import { BucketPermission } from '../../database/models/bucket-permission';
import type { TCustomRequest, TRes } from '../../types';

const deleteBucketPermission = async (req: TCustomRequest, res: TRes) => {
  const { permissionId } = req.params;
  const bucketPermission = BucketPermission.findById(+permissionId);

  if (!bucketPermission) {
    return res({ error: 'Not found' }, 404);
  }

  bucketPermission.delete();

  return res({ success: true });
};

export { deleteBucketPermission };
