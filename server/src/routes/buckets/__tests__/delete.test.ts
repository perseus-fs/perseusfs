import {
  IOPermission,
  QuotaPolicy,
  RetentionPolicy,
  type TBucket
} from '@perseusfs/shared';
import { beforeEach, expect, test } from 'bun:test';
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
  retentionPolicy: RetentionPolicy.NEVER_DELETE
};

let bucketId: number;

beforeEach(() => {
  bucketId = TestContext.ensureBucket(newBucket).id;
});

test('Delete bucket', async () => {
  const response = await fetch(`${TestContext.baseUrl}/buckets/${bucketId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TestContext.loginTokens[1]}`
    }
  });

  expect(response.ok).toBe(true);
  expect(response.status).toBe(200);
});

test('No authentication tries to delete bucket', async () => {
  const response = await fetch(`${TestContext.baseUrl}/buckets/${bucketId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  expect(response.ok).toBe(false);
  expect(response.status).toBe(401);
});

test('User needs higher role to delete bucket', async () => {
  const response = await fetch(`${TestContext.baseUrl}/buckets/${bucketId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TestContext.loginTokens[2]}`
    }
  });

  expect(response.ok).toBe(false);
  expect(response.status).toBe(403);
});

test('Tries to delete bucket that does not exist', async () => {
  const response = await fetch(`${TestContext.baseUrl}/buckets/999999999`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TestContext.loginTokens[1]}`
    }
  });

  expect(response.ok).toBe(false);
  expect(response.status).toBe(404);
});
