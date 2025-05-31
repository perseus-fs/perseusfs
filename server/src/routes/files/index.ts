import { authenticate } from '../../middlewares/authenticate';
import { demoLock } from '../../middlewares/demo-lock';
import { deleteFile } from './delete';
import { bulkDeleteFiles } from './delete-bulk';
import { getFile } from './get';
import { signUrl } from './sign-url';
import { uploadFile } from './upload';

export default [
  {
    method: 'POST',
    path: '/files/sign-url',
    handlers: [authenticate, demoLock, signUrl]
  },
  { method: 'POST', path: '/upload', handlers: [uploadFile] },
  {
    method: 'DELETE',
    path: '/files/:fileId',
    handlers: [authenticate, deleteFile]
  },
  {
    method: 'DELETE',
    path: '/files',
    handlers: [authenticate, demoLock, bulkDeleteFiles]
  },
  {
    method: 'DELETE',
    path: '/files/:fileId',
    handlers: [authenticate, deleteFile]
  },
  { method: 'GET', path: '/:bucketKey/*', handlers: [getFile] }
];
