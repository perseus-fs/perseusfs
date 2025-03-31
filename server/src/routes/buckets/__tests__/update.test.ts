import {
  IOPermission,
  QuotaPolicy,
  RetentionPolicy,
  type TBucket
} from '@perseusfs/shared';
import { beforeEach, expect, test } from 'bun:test';
import { TestContext } from '../../../__tests__/context';
import { Bucket } from '../../../database/models/bucket';

const targetBucket: Partial<TBucket> = {
  name: Math.random().toString(36).substring(2, 15),
  customRead: null,
  customWrite: null,
  quota: null,
  quotaPolicy: QuotaPolicy.UNLIMITED,
  read: IOPermission.PUBLIC,
  write: IOPermission.PUBLIC,
  retention: null,
  retentionPolicy: RetentionPolicy.NEVER_DELETE
};

let bucketId: number;

beforeEach(() => {
  bucketId = TestContext.ensureBucket(targetBucket).id;
});

test('Update bucket', async () => {
  const newData: Partial<TBucket> = {
    name: Math.random().toString(36).substring(2, 15),
    customRead: null,
    customWrite: null,
    quota: 60000,
    quotaPolicy: QuotaPolicy.UNLIMITED,
    read: IOPermission.PRIVATE,
    write: IOPermission.PRIVATE,
    retention: null,
    retentionPolicy: RetentionPolicy.NEVER_DELETE
  };

  const response = await fetch(`${TestContext.baseUrl}/buckets/${bucketId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TestContext.loginTokens[1]}`
    },
    body: JSON.stringify(newData)
  });

  expect(response.ok).toBe(true);
  expect(response.status).toBe(200);

  const dbBucket = await Bucket.findById(bucketId);

  expect(dbBucket).toBeDefined();
  expect(dbBucket?.id).toBe(bucketId);
  expect(dbBucket?.name).toBe(newData.name!);
  expect(dbBucket?.read).toBe(newData.read!);
  expect(dbBucket?.write).toBe(newData.write!);
  expect(dbBucket?.quota).toBe(newData.quota!);
  expect(dbBucket?.quotaPolicy).toBe(newData.quotaPolicy!);
  expect(dbBucket?.retention).toBe(newData.retention!);
  expect(dbBucket?.retentionPolicy).toBe(newData.retentionPolicy!);
  expect(dbBucket?.customRead).toBe(newData.customRead!);
  expect(dbBucket?.customWrite).toBe(newData.customWrite!);
});

test('No authentication tries to update bucket', async () => {
  const response = await fetch(`${TestContext.baseUrl}/buckets/${bucketId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: 'not-gonna-work'
    })
  });

  expect(response.ok).toBe(false);
  expect(response.status).toBe(401);
});

test('User needs higher role to update bucket', async () => {
  const response = await fetch(`${TestContext.baseUrl}/buckets/${bucketId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TestContext.loginTokens[2]}`
    },
    body: JSON.stringify({
      name: 'not-gonna-work'
    })
  });

  expect(response.ok).toBe(false);
  expect(response.status).toBe(403);
});

test('New bucket data is being validated', async () => {
  const wrongBucket: Partial<TBucket> = {
    name: '',
    quota: -1,
    quotaPolicy: 'invalid-policy' as QuotaPolicy,
    read: 'invalid-permission' as IOPermission,
    write: 'invalid-permission' as IOPermission,
    retentionPolicy: 'invalid-policy' as RetentionPolicy
  };

  const response = await fetch(`${TestContext.baseUrl}/buckets/${bucketId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TestContext.loginTokens[1]}`
    },
    body: JSON.stringify(wrongBucket)
  });

  const { errors } = await response.json();

  expect(response.ok).toBe(false);
  expect(response.status).toBe(400);
  expect(errors).toBeDefined();
  expect(errors.name).toBeDefined();
  expect(errors.quota).toBeDefined();
  expect(errors.quotaPolicy).toBeDefined();
  expect(errors.read).toBeDefined();
  expect(errors.write).toBeDefined();
  expect(errors.retentionPolicy).toBeDefined();
  expect(Object.keys(errors).length).toBe(6);
});
