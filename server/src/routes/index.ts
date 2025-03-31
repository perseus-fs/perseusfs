import bucketPermission from './bucket-permission/index';
import buckets from './buckets/index';
import files from './files/index';
import { getInterface } from './interface/get';
import metrics from './metrics';
import requestLogs from './request-logs/index';
import settings from './settings/index';
import users from './users/index';

const routes = [
  { method: 'GET', path: '/_/*', handlers: [getInterface] },
  ...buckets,
  ...bucketPermission,
  ...users,
  ...requestLogs,
  ...settings,
  ...metrics,
  ...files // this needs to be the last route
];

export { routes };
