import { adminOnly, authenticate } from '../../middlewares/authenticate';
import { createBucket } from './create';
import { deleteBucket } from './delete';
import { getBucket } from './get';
import { getBucketPermissions } from './get-permissions';
import { listBuckets } from './list';
import { updateBucket } from './update';

export default [
  { method: 'GET', path: '/buckets', handlers: [authenticate, listBuckets] },
  {
    method: 'POST',
    path: '/buckets',
    handlers: [authenticate, adminOnly, createBucket]
  },
  {
    method: 'PUT',
    path: '/buckets/:bucketId',
    handlers: [authenticate, adminOnly, updateBucket]
  },
  {
    method: 'DELETE',
    path: '/buckets/:bucketId',
    handlers: [authenticate, adminOnly, deleteBucket]
  },
  {
    method: 'GET',
    path: '/buckets/:bucketId',
    handlers: [authenticate, getBucket]
  },
  {
    method: 'GET',
    path: '/buckets/:bucketId/permissions',
    handlers: [authenticate, getBucketPermissions]
  }
];
