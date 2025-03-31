import jwt from 'jsonwebtoken';
import { User } from '../database/models/user';
import { JWT_SECRET } from '../statics';

const getUserFromToken = (token: string | undefined): User | undefined => {
  try {
    if (!token) {
      return undefined;
    }

    const jwtUser = jwt.verify(token, JWT_SECRET);

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
