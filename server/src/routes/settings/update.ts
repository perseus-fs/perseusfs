import {
  SettingKey,
  validateObject,
  ZedSettings,
  type TSettings
} from '@perseusfs/shared';
import { Settings } from '../../database/models/settings';
import { patchInterface } from '../../helpers/patch-interface';
import type { TCustomRequest, TErr, TRes } from '../../types';

type TUpdateSettingsBody = Partial<TSettings>;

const updateSettings = async (req: TCustomRequest, res: TRes, err: TErr) => {
  const body = (await req.json()) as TUpdateSettingsBody;
  const errors = validateObject(body, ZedSettings);

  if (errors) {
    return err(errors);
  }

  Object.values(SettingKey).forEach((key) => {
    const value = (body as any)[key];

    if (key === 'demoMode' && req.user?.id !== 1) {
      // only super user can change demo mode
      return;
    }

    if (value !== undefined) {
      Settings.set(key, value);
    }
  });

  patchInterface();

  return res({ success: true });
};

export { updateSettings };
