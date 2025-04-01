import { SettingKey } from '@perseusfs/shared';
import jwt from 'jsonwebtoken';
import { Settings } from '../../database/models/settings';
import { User } from '../../database/models/user';
import type { TCustomRequest, TErr, TErrors, TRes } from '../../types';

const userLogin = async (req: TCustomRequest, res: TRes, err: TErr) => {
  const body = await req.json();
  const { username, password } = body;
  const errors: TErrors = {};

  if (!username) {
    errors.username = 'Username is required';
  }

  if (!password) {
    errors.password = 'Password is required';
  }

  const hasErrors = Object.keys(errors).length > 0;

  if (hasErrors) {
    return err(errors, 401);
  }

  const user = User.findByName(username);

  if (!user) {
    return err({ username: 'User not found' }, 401);
  }

  if (!Bun.password.verifySync(password, user?.password ?? '')) {
    return err({ password: 'Password is incorrect' }, 401);
  }

  const token = jwt.sign(
    {
      id: user?.id,
      email: user?.email
    },
    Settings.get(SettingKey.JWT_SECRET),
    {
      expiresIn: '30d'
    }
  );

  return res({ token });
};

export { userLogin };
