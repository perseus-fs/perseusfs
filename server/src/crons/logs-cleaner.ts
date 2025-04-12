import chalk from 'chalk';
import { RequestLog } from '../database/models/request-log';

const logsCleaner = () => {
  const deleted = RequestLog.deleteOldLogs();

  if (deleted === 0) {
    return;
  }

  console.log(`${chalk.blue('Cron:')} Deleted ${deleted} old request logs`);
};

export { logsCleaner };
