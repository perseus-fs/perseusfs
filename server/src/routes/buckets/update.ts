import type { TZedBucket } from '@perseusfs/shared';
import { Bucket } from '../../database/models/bucket';
import type { TCustomRequest, TErr, TRes } from '../../types';

type TUpdateBucketBody = Partial<TZedBucket>;

const updateBucket = async (req: TCustomRequest, res: TRes, err: TErr) => {
  const { bucketId } = req.params;
  const body = (await req.json()) as TUpdateBucketBody;

  const bucket = Bucket.findById(+bucketId);

  if (!bucket) {
    return err({ error: 'Bucket not found' }, 404);
  }

  const { managePermission } = req.user?.getBucketPermissions(bucket.id) ?? {};

  if (!managePermission) {
    return err({ error: 'Forbidden' }, 403);
  }

  const [, errors] = Bucket.update(bucket.id, {
    name: body.name,
    read: body.read,
    write: body.write,
    customRead: body.customRead,
    customWrite: body.customWrite,
    quota: body.quota,
    retention: body.retention,
    quotaPolicy: body.quotaPolicy,
    retentionPolicy: body.retentionPolicy
  });

  if (errors) {
    return err(errors);
  }

  return res({ success: true });
};

export { updateBucket };
