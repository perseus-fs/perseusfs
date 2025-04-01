import { DEFAULT_USER_PERMISSIONS, validateObject } from '@perseusfs/shared';
import { z } from 'zod';
import { Bucket } from '../../database/models/bucket';
import { File } from '../../database/models/file';
import { generateSignedUrl } from '../../helpers/signed';
import type { TCustomRequest, TErr, TRes } from '../../types';

type TCreateBucketBody = {
  bucketId: string;
  fileName: string;
  expiresInSeconds: number;
};

const bodySchema = z.object({
  bucketId: z.number().min(1),
  fileName: z.string().nonempty(),
  expiresInSeconds: z.number().min(1)
});

const signUrl = async (req: TCustomRequest, res: TRes, err: TErr) => {
  const body = (await req.json()) as TCreateBucketBody;
  const errors = validateObject(body, bodySchema);

  if (errors) {
    return err(errors, 400);
  }

  const { bucketId, fileName, expiresInSeconds } = body;

  const bucket = Bucket.findById(+bucketId);

  if (!bucket) {
    return err({ bucketId: 'Not found' }, 404);
  }

  const file = File.findByBucketAndKey(bucket.id, fileName);

  if (!file) {
    return err({ fileName: 'Not found' }, 404);
  }

  const { readPermission } =
    req.user?.getBucketPermissions(bucket.id) ?? DEFAULT_USER_PERMISSIONS;

  if (!readPermission) {
    return err({ bucketId: 'Forbidden' }, 403);
  }

  const signedUrl = generateSignedUrl(bucket.name, fileName, expiresInSeconds);

  return res({
    signedUrl
  });
};

export { signUrl };
