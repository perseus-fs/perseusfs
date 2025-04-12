import { SettingKey } from '@perseusfs/shared';
import { RequestLog } from '../../database/models/request-log';
import { Settings } from '../../database/models/settings';
import type { TCustomRequest, TRes } from '../../types';

const listRequestLogs = async (req: TCustomRequest, res: TRes) => {
  const logs = await RequestLog.findAll();

  const demoMode = Settings.get(SettingKey.DEMO_MODE);
  const isSuperUser = req.user?.id === 1;
  const isDemoLocked = demoMode && !isSuperUser;

  const targetLogs = isDemoLocked
    ? logs.map((log) => ({
        ...log,
        address: 'hidden'
      }))
    : logs;

  return res({
    logs: targetLogs
  });
};

export { listRequestLogs };
