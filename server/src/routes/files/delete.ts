import { DEFAULT_USER_PERMISSIONS, IOPermission } from '@perseusfs/shared';
import { Bucket } from '../../database/models/bucket';
import { File } from '../../database/models/file';
import { getUserFromToken } from '../../helpers/get-user-from-token';
import type { TCustomRequest, TRes } from '../../types';

const deleteFile = async (req: TCustomRequest, res: TRes, err: TRes) => {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  const { fileId } = req.params;
  const file = File.findById(+fileId);

  if (!file) {
    return res({ error: 'Not found' }, 404);
  }

  const bucket = Bucket.findById(file.bucketId);

  if (!bucket) {
    return res({ error: 'Bucket not found' }, 404);
  }

  const user = getUserFromToken(token);

  if (bucket.write !== IOPermission.PUBLIC) {
    if (bucket.write === IOPermission.PRIVATE) {
      if (!user) {
        return err({ error: 'Unauthorized' }, 401);
      }

      const { writePermission } =
        user?.getBucketPermissions(file.bucketId) ?? DEFAULT_USER_PERMISSIONS;

      if (!writePermission) {
        return err({ error: 'Forbidden' }, 403);
      }
    } else if (bucket.write === IOPermission.CUSTOM) {
      req.user = user;

      try {
        if (bucket.customWrite) {
          const fn = eval(bucket.customWrite);
          const customFnResult = await fn(req, file.name, bucket);

          if (!customFnResult) {
            return new Response('Forbidden', { status: 403 });
          }
        }
      } catch {
        return new Response('Internal Server Error', { status: 500 });
      }
    }
  }

  file.delete();

  return res({ success: true });
};

export { deleteFile };
