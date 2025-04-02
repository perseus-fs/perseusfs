import { UserRole, type TZedBucket } from '@perseusfs/shared';
import { User } from '../../database/models/user';
import type { TCustomRequest, TErr, TRes } from '../../types';

type TCreateUserBody = Partial<TZedBucket>;

const createUser = async (req: TCustomRequest, res: TRes, err: TErr) => {
  const body = (await req.json()) as TCreateUserBody;

  if (req.user?.role !== UserRole.ADMIN) {
    return err({ error: 'Forbidden' }, 403);
  }

  const [userId, errors] = User.create(body);

  if (errors) {
    return err(errors);
  }

  return res({ success: true, userId });
};

export { createUser };
