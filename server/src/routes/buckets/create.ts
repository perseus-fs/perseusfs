import {
  BucketPermission,
  IOPermission,
  QuotaPolicy,
  RetentionPolicy,
  SettingKey,
  UserRole,
  type TZedBucket
} from '@perseusfs/shared';
import { Bucket } from '../../database/models/bucket';
import { Settings } from '../../database/models/settings';
import type { TCustomRequest, TErr, TRes } from '../../types';

type TCreateBucketBody = Partial<TZedBucket>;

const createBucket = async (req: TCustomRequest, res: TRes, err: TErr) => {
  const body = (await req.json()) as TCreateBucketBody;

  if (req.user?.role !== UserRole.ADMIN) {
    return err({ error: 'Forbidden' }, 403);
  }

  // if it's a demo mode and it's not the super user, use locked down settings
  if (Settings.get(SettingKey.DEMO_MODE) && req.user?.id !== 1) {
    body.quotaPolicy = QuotaPolicy.LIMITED;
    body.quota = 5 * 1024 * 1024; // 5MB
    body.retentionPolicy = RetentionPolicy.DISPOSE;
    body.retention = 300; // 5 minutes
    body.read = IOPermission.PRIVATE;
    body.write = IOPermission.PRIVATE;
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
