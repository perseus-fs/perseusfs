import { File } from '../../database/models/file';
import { getUserFromToken } from '../../helpers/get-user-from-token';
import type { TCustomRequest, TRes } from '../../types';
import { canDeleteFile } from './helpers/can-delete-file';

const deleteFile = async (req: TCustomRequest, res: TRes, err: TRes) => {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  const { fileId } = req.params;
  const file = File.findById(+fileId);

  if (!file) return res({ error: 'Not found' }, 404);

  const user = getUserFromToken(token);
  const allowed = await canDeleteFile(req, file, user);

  if (!allowed) return err({ error: 'Forbidden' }, 403);

  file.delete();

  return res({ success: true });
};

export { deleteFile };
