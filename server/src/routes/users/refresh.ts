import { StaticKey } from '@perseusfs/shared';
import jwt from 'jsonwebtoken';
import { Statics } from '../../database/models/statics';
import type { TCustomRequest, TRes } from '../../types';

const refreshToken = async (req: TCustomRequest, res: TRes) => {
  const body = await req.json();
  const { refreshToken } = body;

  const payload = jwt.verify(
    refreshToken,
    Statics.get(StaticKey.JWT_REFRESH_SECRET)
  ) as jwt.JwtPayload;

  const token = jwt.sign(
    {
      id: payload.id
    },
    Statics.get(StaticKey.JWT_SECRET),
    {
      expiresIn: '7d'
    }
  );

  return res({ token });
};

export { refreshToken };
