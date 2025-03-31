import { User } from '../../database/models/user';
import type { TCustomRequest, TRes } from '../../types';

const listUsers = async (req: TCustomRequest, res: TRes) => {
  const users = User.findAll();

  return res({ users });
};

export { listUsers };
