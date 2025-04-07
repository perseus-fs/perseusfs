import { StaticKey } from '@perseusfs/shared';
import jwt from 'jsonwebtoken';
import { Statics } from '../database/models/statics';
import { User } from '../database/models/user';

const getUserFromToken = (token: string | undefined): User | undefined => {
  try {
    if (!token) {
      return undefined;
    }

    const jwtUser = jwt.verify(token, Statics.get(StaticKey.JWT_SECRET));

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
