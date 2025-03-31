import { UserRole } from '@perseusfs/shared';
import { getUserFromToken } from '../helpers/get-user-from-token';
import type { TCustomRequest, TRes } from '../types';

const authenticate = async (req: TCustomRequest, res: TRes) => {
  const headers = new Headers(req.headers);
  const token = headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res({ message: 'Unauthorized' }, 401);
  }

  const user = getUserFromToken(token);

  if (!user) {
    return res({ message: 'Unauthorized' }, 401);
  }

  req.user = user;
};

const adminOnly = async (req: TCustomRequest, res: TRes) => {
  if (!req.user || req.user.role !== UserRole.ADMIN) {
    return res({ message: 'Forbidden' }, 403);
  }
};

export { adminOnly, authenticate };
