import {
  BucketPermission as EBucketPermission,
  IOPermission,
  QuotaPolicy,
  RetentionPolicy,
  UserRole
} from '@perseusfs/shared';
import { afterAll, beforeAll, beforeEach } from 'bun:test';
import { server } from '../app';
import { Bucket } from '../database/models/bucket';
import { BucketPermission } from '../database/models/bucket-permission';
import { File } from '../database/models/file';
import { User } from '../database/models/user';
import { TestContext } from './context';

const loadMocks = () => {
  const results = [
    // --------------- USERS
    User.create({
      name: 'user-2',
      role: UserRole.USER,
      password: 'password',
      email: 'standard@user.com'
    }),
    User.create({
      name: 'user-3',
      role: UserRole.USER,
      password: 'password',
      email: 'user3@user.com'
    }),
    User.create({
      name: 'user-4',
      role: UserRole.USER,
      password: 'password',
      email: 'user4@user.com'
    }),
    User.create({
      name: 'user-5',
      role: UserRole.USER,
      password: 'password',
      email: 'user5@user.com'
    }),
    // --------------- BUCKETS
    Bucket.create({
      name: 'bucket-2',
      customRead: null,
      customWrite: null,
      quota: null,
      quotaPolicy: QuotaPolicy.UNLIMITED,
      read: IOPermission.PRIVATE,
      write: IOPermission.PUBLIC,
      retention: null,
      retentionPolicy: RetentionPolicy.NEVER_DELETE
    }),
    // --------------- PERMISSIONS
    BucketPermission.create({
      userId: 2,
      bucketId: 1,
      permission: EBucketPermission.READ
    }),
    BucketPermission.create({
      userId: 3,
      bucketId: 2,
      permission: EBucketPermission.OWNER
    }),
    BucketPermission.create({
      userId: 4,
      bucketId: 1,
      permission: EBucketPermission.WRITE
    }),
    BucketPermission.create({
      userId: 4,
      bucketId: 2,
      permission: EBucketPermission.READ_WRITE
    }),
    BucketPermission.create({
      userId: 5,
      bucketId: 1,
      permission: EBucketPermission.OWNER
    })
  ];

  results.forEach((result) => {
    if (!result) {
      throw new Error('Failed to create test data');
    }
  });

  File.writeFile(
    TestContext.getStringAsArrayBuffer(500),
    2,
    undefined,
    'private.txt'
  );
};

afterAll(() => server.stop());

beforeAll(async () => {
  loadMocks();
  await TestContext.init(server);
});

beforeEach(() => {
  TestContext.resetDatabase(); // makes sure the database isn't altered from the previous test
  loadMocks();
});
