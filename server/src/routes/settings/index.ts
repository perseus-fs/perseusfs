import { adminOnly, authenticate } from '../../middlewares/authenticate';
import { demoLock } from '../../middlewares/demo-lock';
import { listSettings } from './list';
import { updateSettings } from './update';

export default [
  {
    method: 'GET',
    path: '/settings',
    handlers: [authenticate, adminOnly, listSettings]
  },
  {
    method: 'PUT',
    path: '/settings',
    handlers: [authenticate, adminOnly, demoLock, updateSettings]
  }
];
