import { Cron } from 'croner';
import { isTesting } from '../helpers/is-testing';
import { filesCleaner } from './files-cleaner';
import { logsCleaner } from './logs-cleaner';

const EVERY_MINUTE = '*/1 * * * *';
const EVERY_HOUR = '0 * * * *';

const filesCleanerJob = new Cron(EVERY_MINUTE, filesCleaner);
const logsCleanerJob = new Cron(EVERY_HOUR, logsCleaner);

const loadCrons = () => {
  if (isTesting()) return;

  filesCleanerJob.trigger();
  logsCleanerJob.trigger();
};

export { loadCrons };
