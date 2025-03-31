import { User } from '../../database/models/user';
import type { TCustomRequest, TRes } from '../../types';

const deleteUser = async (req: TCustomRequest, res: TRes) => {
  const { userId } = req.params;
  const user = User.findById(+userId);

  if (!user) {
    return res({ error: 'Not found' }, 404);
  }

  if (user.id === 1) {
    return res({ error: 'Cannot delete the root user' }, 400);
  }

  user.delete();

  return res({ success: true });
};

export { deleteUser };
