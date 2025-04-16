import { DEFAULT_USER_PERMISSIONS, validateObject } from '@perseusfs/shared';
import { z } from 'zod';
import { Bucket } from '../../database/models/bucket';
import { File } from '../../database/models/file';
import { generateSignedUrl } from '../../helpers/signed';
import type { TCustomRequest, TErr, TRes } from '../../types';

type TCreateBucketBody = {
  fileId: number;
  expiresInSeconds: number;
};

const bodySchema = z.object({
  fileId: z.number().min(1),
  expiresInSeconds: z.number().min(1)
});

const signUrl = async (req: TCustomRequest, res: TRes, err: TErr) => {
  const body = (await req.json()) as TCreateBucketBody;
  const errors = validateObject(body, bodySchema);

  if (errors) {
    return err(errors, 400);
  }

  const { fileId, expiresInSeconds } = body;

  const file = File.findById(fileId);

  if (!file) {
    return err({ fileName: 'Not found' }, 404);
  }

  const bucket = Bucket.findById(file?.bucketId);

  if (!bucket) {
    return err({ bucketId: 'Not found' }, 404);
  }

  const { readPermission } =
    req.user?.getBucketPermissions(bucket.id) ?? DEFAULT_USER_PERMISSIONS;

  if (!readPermission) {
    return err({ bucketId: 'Forbidden' }, 403);
  }

  const signedUrl = generateSignedUrl(
    bucket.name,
    file.getPath(),
    expiresInSeconds
  );

  return res({
    signedUrl
  });
};

export { signUrl };
