import {
  DEFAULT_USER_PERMISSIONS,
  FileHeader,
  IOPermission
} from '@perseusfs/shared';
import { z } from 'zod';
import { Bucket } from '../../database/models/bucket';
import { File } from '../../database/models/file';
import { getUserFromToken } from '../../helpers/get-user-from-token';
import type { TCustomRequest, TErr, TErrors, TRes } from '../../types';

const nameSchema = z.string().nonempty().min(1).max(255);

const uploadFile = async (req: TCustomRequest, res: TRes, err: TErr) => {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  const fileName = req.headers.get(FileHeader.FILENAME);
  const bucketIdStr = req.headers.get(FileHeader.BUCKET_ID) ?? '';
  const bucketId = parseInt(bucketIdStr, 10);

  const errors: TErrors = {};

  const { success: nameValid, error: nameError } =
    nameSchema.safeParse(fileName);

  if (!nameValid) {
    errors.fileName = nameError?.message;
  }

  const hasErrors = Object.keys(errors).length > 0;

  if (hasErrors) {
    return err(errors);
  }

  const bucket = Bucket.findById(bucketId);

  if (!bucket) {
    return err({ bucketId: 'Not found' }, 404);
  }

  const user = getUserFromToken(token);

  if (bucket.write !== IOPermission.PUBLIC) {
    if (bucket.write === IOPermission.PRIVATE) {
      if (!user) {
        return err({ bucketId: 'Unauthorized' }, 401);
      }

      const { writePermission } =
        user?.getBucketPermissions(bucketId) ?? DEFAULT_USER_PERMISSIONS;

      if (!writePermission) {
        return err({ bucketId: 'Forbidden' }, 403);
      }
    } else if (bucket.write === IOPermission.CUSTOM) {
      req.user = user;

      try {
        if (bucket.customWrite) {
          const fn = eval(bucket.customWrite);
          const customFnResult = await fn(req, fileName, bucket);

          if (!customFnResult) {
            return new Response('Forbidden', { status: 403 });
          }
        }
      } catch {
        return new Response('Internal Server Error', { status: 500 });
      }
    }
  }

  const fileData = await req.arrayBuffer();

  const result = File.writeFile(fileData, bucketId, user?.id, fileName!);

  return res(result, 200);
};

export { uploadFile };
