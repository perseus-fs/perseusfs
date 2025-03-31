import { adminOnly, authenticate } from '../../middlewares/authenticate';
import { getMetrics } from './get';

export default [
  {
    method: 'GET',
    path: '/metrics',
    handlers: [authenticate, adminOnly, getMetrics]
  }
];
