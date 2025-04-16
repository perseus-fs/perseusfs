import { DEFAULT_USER_PERMISSIONS } from '@perseusfs/shared';
import { Bucket } from '../../database/models/bucket';
import { File } from '../../database/models/file';
import type { TCustomRequest, TRes } from '../../types';

const getBucketByName = async (req: TCustomRequest, res: TRes) => {
  const { bucketName } = req.params;

  const bucket = Bucket.findByName(bucketName);

  if (!bucket) {
    return res({ error: 'Not found' }, 404);
  }

  const { readPermission } =
    req.user?.getBucketPermissions(bucket.id) ?? DEFAULT_USER_PERMISSIONS;

  if (!readPermission) {
    return res({ error: 'Forbidden' }, 403);
  }

  const files = File.findAllByBucketId(bucket.id);

  const userPermissions =
    req.user?.getBucketPermissions(bucket.id) ?? DEFAULT_USER_PERMISSIONS;

  return res({ files, bucket, userPermissions });
};

export { getBucketByName };
