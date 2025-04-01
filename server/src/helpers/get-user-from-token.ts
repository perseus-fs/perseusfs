import { SettingKey } from '@perseusfs/shared';
import jwt from 'jsonwebtoken';
import { Settings } from '../database/models/settings';
import { User } from '../database/models/user';

const getUserFromToken = (token: string | undefined): User | undefined => {
  try {
    if (!token) {
      return undefined;
    }

    const jwtUser = jwt.verify(token, Settings.get(SettingKey.JWT_SECRET));

    if (!jwtUser || typeof jwtUser === 'string') {
      return undefined;
    }

    const user = User.findById(jwtUser.id);

    if (!user) {
      return undefined;
    }

    return user;
  } catch {
    return undefined;
  }
};

export { getUserFromToken };
