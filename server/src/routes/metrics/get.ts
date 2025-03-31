import type { TMetrics } from '@perseusfs/shared';
import os from 'os';
import { Bucket } from '../../database/models/bucket';
import { File } from '../../database/models/file';
import { RequestLog } from '../../database/models/request-log';
import { Settings } from '../../database/models/settings';
import type { TCustomRequest, TRes } from '../../types';

const getRealCpuUsagePercentage = async (time: number = 500) => {
  const startUsage = process.cpuUsage();
  const startTime = process.hrtime();

  await new Promise((resolve) => setTimeout(resolve, time));

  const endUsage = process.cpuUsage(startUsage);
  const endTime = process.hrtime(startTime);

  // Convert time to microseconds
  const elapsedTime = endTime[0] * 1e6 + endTime[1] / 1e3;
  const totalUsage = (endUsage.user + endUsage.system) / time; // Convert to milliseconds

  // Get CPU cores count for normalization
  const numCpus = os.cpus().length;

  // Normalize CPU usage by time and core count
  return (totalUsage / elapsedTime) * 100 * numCpus;
};

const getMetrics = async (req: TCustomRequest, res: TRes) => {
  const dbSize = Settings.getDatabaseSize();
  const logsCount = RequestLog.getCount();
  const filesCount = File.getCount();
  const filesSize = File.getFilesSize();
  const bucketsCount = Bucket.getCount();
  const memoryUsage = process.memoryUsage();
  const uptime = process.uptime();
  const logsStats = RequestLog.getStats();
  const cpuUsage = await getRealCpuUsagePercentage();

  const metrics: TMetrics = {
    dbSize,
    logsCount,
    filesCount,
    filesSize,
    bucketsCount,
    memoryUsage,
    uptime,
    cpuUsage,
    logsStats
  };

  return res({
    metrics
  });
};

export { getMetrics };
