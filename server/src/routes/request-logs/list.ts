import { RequestLog } from '../../database/models/request-log';
import type { TCustomRequest, TRes } from '../../types';

const listRequestLogs = async (req: TCustomRequest, res: TRes) => {
  const logs = await RequestLog.findAll();

  return res({
    logs
  });
};

export { listRequestLogs };
