import { authenticate } from '../../middlewares/authenticate';
import { deleteFile } from './delete';
import { getFile } from './get';
import { uploadFile } from './upload';

export default [
  { method: 'POST', path: '/upload', handlers: [uploadFile] },
  {
    method: 'DELETE',
    path: '/files/:fileId',
    handlers: [authenticate, deleteFile]
  },
  { method: 'GET', path: '/:bucketKey/*', handlers: [getFile] }
];
