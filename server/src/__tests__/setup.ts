import {
  BucketPermission as EBucketPermission,
  IOPermission,
  QuotaPolicy,
  RetentionPolicy,
  StaticKey,
  UserRole
} from '@perseusfs/shared';
import { afterAll, beforeAll, beforeEach } from 'bun:test';
import { server } from '../app';
import { Bucket } from '../database/models/bucket';
import { BucketPermission } from '../database/models/bucket-permission';
import { File } from '../database/models/file';
import { Statics } from '../database/models/statics';
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
    Bucket.create({
      name: 'bucket-3',
      customRead: null,
      customWrite: null,
      quota: 500000, // 500KB
      quotaPolicy: QuotaPolicy.LIMITED,
      read: IOPermission.PUBLIC,
      write: IOPermission.PUBLIC,
      retention: null,
      retentionPolicy: RetentionPolicy.NEVER_DELETE
    }),
    Bucket.create({
      name: 'bucket-4',
      customRead: null,
      customWrite: null,
      quota: 500000, // 500KB
      quotaPolicy: QuotaPolicy.LIMITED,
      read: IOPermission.PUBLIC,
      write: IOPermission.PUBLIC,
      retention: null,
      retentionPolicy: RetentionPolicy.NEVER_DELETE
    }),
    Bucket.create({
      name: 'bucket-5',
      customRead: null,
      customWrite: null,
      quota: 500000, // 500KB
      quotaPolicy: QuotaPolicy.LIMITED,
      read: IOPermission.PUBLIC,
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

  // make sure the secrets are always the same so we don't need to login all the time to get a valid token
  Statics.set(StaticKey.JWT_SECRET, 'talk quietly');
  Statics.set(StaticKey.SIGNED_URL_SECRET, 'its a secret');
};

afterAll(() => server.stop());

beforeAll(async () => {
  loadMocks();
  await TestContext.init(server);
});

beforeEach(async () => {
  await TestContext.resetDatabase(); // makes sure the database isn't altered from the previous test
  loadMocks();
});
