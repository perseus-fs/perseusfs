import { SettingKey } from '@perseusfs/shared';
import { Settings } from '../database/models/settings';
import type { TCustomRequest, TRes } from '../types';

const demoLock = async (req: TCustomRequest, res: TRes) => {
  if (!req.user) {
    return res({ message: 'Unauthorized' }, 401);
  }

  const demoMode = Settings.get(SettingKey.DEMO_MODE);

  if (demoMode && req.user.id !== 1) {
    return res({ message: 'Forbidden' }, 403);
  }
};

export { demoLock };
