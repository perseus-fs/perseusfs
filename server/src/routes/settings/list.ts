import { Settings } from '../../database/models/settings';
import type { TCustomRequest, TRes } from '../../types';

const listSettings = async (req: TCustomRequest, res: TRes) => {
  const settings = Settings.toJSON();

  return res({
    settings
  });
};

export { listSettings };
