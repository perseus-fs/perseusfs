import { Bucket } from '../../database/models/bucket';
import type { TCustomRequest, TRes } from '../../types';

const deleteBucket = async (req: TCustomRequest, res: TRes) => {
  const { bucketId } = req.params;
  const bucket = Bucket.findById(+bucketId);

  if (!bucket) {
    return res({ error: 'Bucket not found' }, 404);
  }

  bucket.delete();

  return res({ success: true });
};

export { deleteBucket };
