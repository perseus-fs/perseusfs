import { authenticate } from '../../middlewares/authenticate';
import { deleteFile } from './delete';
import { getFile } from './get';
import { signUrl } from './sign-url';
import { uploadFile } from './upload';

export default [
  {
    method: 'POST',
    path: '/files/sign-url',
    handlers: [authenticate, signUrl]
  },
  { method: 'POST', path: '/upload', handlers: [uploadFile] },
  {
    method: 'DELETE',
    path: '/files/:fileId',
    handlers: [authenticate, deleteFile]
  },
  { method: 'GET', path: '/:bucketKey/*', handlers: [getFile] }
];
