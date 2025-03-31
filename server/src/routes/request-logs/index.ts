import { adminOnly, authenticate } from '../../middlewares/authenticate';
import { listRequestLogs } from './list';

export default [
  {
    method: 'GET',
    path: '/request_logs',
    handlers: [authenticate, adminOnly, listRequestLogs]
  }
];
