import { BucketPermission, UserRole, type TZedBucket } from '@perseusfs/shared';
import { Bucket } from '../../database/models/bucket';
import type { TCustomRequest, TErr, TRes } from '../../types';

type TCreateBucketBody = Partial<TZedBucket>;

const createBucket = async (req: TCustomRequest, res: TRes, err: TErr) => {
  const body = (await req.json()) as TCreateBucketBody;

  if (req.user?.role !== UserRole.ADMIN) {
    return err({ error: 'Forbidden' }, 403);
  }

  const [bucketId, errors] = Bucket.create(body);

  if (errors) {
    return err(errors);
  }

  const bucket = Bucket.findById(Number(bucketId));

  if (!bucket) {
    return err({ error: 'Not found' }, 404);
  }

  bucket.addPermission(req.user!.id, BucketPermission.OWNER);

  return res({ success: true, bucketId });
};

export { createBucket };
