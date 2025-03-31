import { User } from '../../database/models/user';
import type { TCustomRequest, TRes } from '../../types';

const getUser = async (req: TCustomRequest, res: TRes) => {
  const { userId } = req.params;

  const user = User.findById(+userId);

  if (!user) {
    return res({ error: 'Not found' }, 404);
  }

  return res({ user });
};

export { getUser };
