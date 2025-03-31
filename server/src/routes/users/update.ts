import type { TZedUser } from '@perseusfs/shared';
import { User } from '../../database/models/user';
import type { TCustomRequest, TErr, TRes } from '../../types';

type TUpdateUserBody = Partial<TZedUser>;

const updateUser = async (req: TCustomRequest, res: TRes, err: TErr) => {
  const { userId } = req.params;
  const body = (await req.json()) as TUpdateUserBody;

  const user = User.findById(+userId);

  if (!user) {
    return err({ error: 'Not found' }, 404);
  }

  if (user.id === 1) {
    return err({ error: 'Cannot update the default user' }, 403);
  }

  const [success, errors] = user.update({
    name: body.name,
    role: body.role,
    password: body.password,
    email: body.email
  });

  if (!success) {
    return err(errors);
  }

  return res({ success: true });
};

export { updateUser };
