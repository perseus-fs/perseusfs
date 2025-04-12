import { Cron } from 'croner';
import { isTesting } from '../helpers/is-testing';
import { filesCleaner } from './files-cleaner';

const EVERY_MINUTE = '*/1 * * * *';

const tenMinJob = new Cron(EVERY_MINUTE, {});

const loadCrons = () => {
  if (isTesting()) return;

  tenMinJob.schedule(filesCleaner);
  tenMinJob.trigger();
};

export { loadCrons };
