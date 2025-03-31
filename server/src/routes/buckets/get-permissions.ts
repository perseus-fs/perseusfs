import { Bucket } from '../../database/models/bucket';
import type { TCustomRequest, TRes } from '../../types';

const getBucketPermissions = async (req: TCustomRequest, res: TRes) => {
  const { bucketId } = req.params;

  const bucket = Bucket.findById(+bucketId);

  if (!bucket) {
    return res({ error: 'Bucket not found' }, 404);
  }

  const permissions = bucket.getPermissions();

  return res({ permissions });
};

export { getBucketPermissions };
