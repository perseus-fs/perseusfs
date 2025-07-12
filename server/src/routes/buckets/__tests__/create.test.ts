import {
  IOPermission,
  QuotaPolicy,
  RetentionPolicy,
  type TBucket
} from '@perseusfs/shared';
import { expect, test } from 'bun:test';
import { TestContext } from '../../../__tests__/context';

const newBucket: Partial<TBucket> = {
  name: Math.random().toString(36).substring(2, 15),
  customRead: null,
  customWrite: null,
  quota: null,
  quotaPolicy: QuotaPolicy.UNLIMITED,
  read: IOPermission.PUBLIC,
  write: IOPermission.PUBLIC,
  retention: null,
  retentionPolicy: RetentionPolicy.NEVER_DELETE,
  extraHeaders: {
    'X-Custom-Header': 'CustomValue'
  }
};

test('Create bucket', async () => {
  const response = await fetch(`${TestContext.baseUrl}/buckets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TestContext.loginTokens[1]}`
    },
    body: JSON.stringify(newBucket)
  });

  expect(response.ok).toBe(true);

  const { success, bucketId } = await response.json();

  expect(response.status).toBe(200);
  expect(success).toBe(true);
  expect(bucketId).toBeDefined();
});

test('No authentication tries to create bucket', async () => {
  const response = await fetch(`${TestContext.baseUrl}/buckets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(newBucket)
  });

  expect(response.ok).toBe(false);
  expect(response.status).toBe(401);
});

test('User needs higher role to create bucket', async () => {
  const response = await fetch(`${TestContext.baseUrl}/buckets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TestContext.loginTokens[2]}`
    },
    body: JSON.stringify(newBucket)
  });

  expect(response.ok).toBe(false);
  expect(response.status).toBe(403);
});

test('New bucket data is being validated', async () => {
  const wrongBucket: Partial<TBucket> = {
    name: '.',
    customRead: null,
    customWrite: null,
    quota: -1,
    quotaPolicy: 'never' as QuotaPolicy,
    read: 'gonna' as IOPermission,
    write: 'give' as IOPermission,
    retention: 'you' as unknown as number,
    retentionPolicy: 'up' as RetentionPolicy,
    extraHeaders: 'i-should-be-an-object' as any
  };

  const response = await fetch(`${TestContext.baseUrl}/buckets`, {
    method: 'POST',
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
  expect(errors.read).toBeDefined();
  expect(errors.write).toBeDefined();
  expect(errors.quota).toBeDefined();
  expect(errors.quotaPolicy).toBeDefined();
  expect(errors.retention).toBeDefined();
  expect(errors.retentionPolicy).toBeDefined();
  expect(errors.extraHeaders).toBeDefined();
  expect(Object.keys(errors).length).toBe(8);
});
