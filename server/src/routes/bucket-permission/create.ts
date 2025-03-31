import type { TZedBucketPermission } from '@perseusfs/shared';
import { Bucket } from '../../database/models/bucket';
import { User } from '../../database/models/user';
import type { TCustomRequest, TErr, TRes } from '../../types';

type TCreateBuckePermissiontBody = Partial<TZedBucketPermission>;

const createBucketPermission = async (
  req: TCustomRequest,
  res: TRes,
  err: TErr
) => {
  const { permission, userId, bucketId } =
    (await req.json()) as TCreateBuckePermissiontBody;

  const bucket = Bucket.findById(+bucketId!);

  if (!bucket) {
    return err({ bucketId: 'Bucket not found' }, 404);
  }

  const user = User.findById(userId);

  if (!user) {
    return err({ userId: 'User not found' }, 404);
  }

  const [success, errors] = bucket.addPermission(user.id, permission);

  if (!success) {
    return err(errors);
  }

  return res({ success: true });
};

export { createBucketPermission };
