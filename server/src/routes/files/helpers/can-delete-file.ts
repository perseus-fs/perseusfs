import { DEFAULT_USER_PERMISSIONS, IOPermission } from '@perseusfs/shared';
import { Bucket } from '../../../database/models/bucket';
import type { File } from '../../../database/models/file';
import type { User } from '../../../database/models/user';
import type { TCustomRequest } from '../../../types';

const canDeleteFile = async (
  req: TCustomRequest,
  file: File,
  user?: User
): Promise<boolean> => {
  const bucket = Bucket.findById(file.bucketId);

  if (!bucket) throw new Error('Bucket not found');

  if (bucket.write === IOPermission.PUBLIC) return true;

  if (bucket.write === IOPermission.PRIVATE) {
    if (!user) return false;

    const { writePermission } =
      user.getBucketPermissions(file.bucketId) ?? DEFAULT_USER_PERMISSIONS;

    return writePermission;
  }

  if (bucket.write === IOPermission.CUSTOM) {
    if (!user || !bucket.customWrite) return false;

    req.user = user;

    try {
      const fn = eval(bucket.customWrite);
      const result = await fn(req, file.name, bucket);

      return result === true;
    } catch {
      throw new Error('Error evaluating custom permission');
    }
  }

  return false;
};

export { canDeleteFile };
