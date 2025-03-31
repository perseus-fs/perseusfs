import { adminOnly, authenticate } from '../../middlewares/authenticate';
import { createBucketPermission } from './create';
import { deleteBucketPermission } from './delete';
import { getBucketPermission } from './get';
import { updateBucketPermission } from './update';

export default [
  {
    method: 'POST',
    path: '/bucket_permissions',
    handlers: [authenticate, adminOnly, createBucketPermission]
  },
  {
    method: 'GET',
    path: '/bucket_permissions/:bucketPermissionId',
    handlers: [authenticate, adminOnly, getBucketPermission]
  },
  {
    method: 'PUT',
    path: '/bucket_permissions/:bucketPermissionId',
    handlers: [authenticate, adminOnly, updateBucketPermission]
  },
  {
    method: 'DELETE',
    path: '/bucket_permissions/:permissionId',
    handlers: [authenticate, adminOnly, deleteBucketPermission]
  }
];
