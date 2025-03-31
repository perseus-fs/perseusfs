import { Bucket } from '../../database/models/bucket';
import type { TCustomRequest, TRes } from '../../types';

const listBuckets = async (req: TCustomRequest, res: TRes) => {
  const buckets = Bucket.findAllByUserId(req.user?.id);

  return res({ buckets });
};

export { listBuckets };
