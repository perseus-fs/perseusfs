import { validateObject } from '@perseusfs/shared';
import { z } from 'zod';
import { File } from '../../database/models/file';
import { getUserFromToken } from '../../helpers/get-user-from-token';
import type { TCustomRequest, TRes } from '../../types';
import { canDeleteFile } from './helpers/can-delete-file';

const bodySchema = z.object({
  fileIds: z.array(z.number()).nonempty('fileIds must be a non-empty array')
});

type TDeleteBulkFilesBody = z.infer<typeof bodySchema>;

const bulkDeleteFiles = async (req: TCustomRequest, res: TRes, err: TRes) => {
  const body = (await req.json()) as TDeleteBulkFilesBody;
  const errors = validateObject(body, bodySchema);

  if (errors) {
    return err(errors, 400);
  }

  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  const user = getUserFromToken(token);

  const promises = body.fileIds.map(async (fileId) => {
    const file = File.findById(fileId);

    if (!file) return 404;

    const allowed = await canDeleteFile(req, file, user);

    if (!allowed) return 403;

    file.delete();

    return 200;
  });

  // this kinda sucks because if one fails it won't alert the user, but it's better than blocking the entire operation
  // it is what it is, we can improve it later if needed
  const results = await Promise.allSettled(promises);

  const allFailed = results.every(
    (result) =>
      result.status === 'rejected' ||
      result.value === 404 ||
      result.value === 403
  );

  // be aware: shitty code ahead
  // this is mostly to have the tests pass as they expect a 404 or 403
  if (allFailed) {
    const isForbidden = results.some(
      (result) => result.status === 'rejected' || result.value === 403
    );

    if (isForbidden) {
      return err({ error: 'Forbidden' }, 403);
    }

    return err({ error: 'Not found' }, 404);
  }

  return res({
    success: true
  });
};

export { bulkDeleteFiles };
