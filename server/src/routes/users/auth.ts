import { SettingKey } from '@perseusfs/shared';
import { Settings } from '../../database/models/settings';
import type { TCustomRequest, TRes } from '../../types';

const userAuth = async (req: TCustomRequest, res: TRes) => {
  if (req.user) {
    req.user.updateLastSeen();
  }

  return res({ user: req.user, demoMode: Settings.get(SettingKey.DEMO_MODE) });
};

export { userAuth };
