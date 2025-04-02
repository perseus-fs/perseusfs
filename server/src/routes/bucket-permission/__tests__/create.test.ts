import { BucketPermission, type TBucketPermission } from '@perseusfs/shared';
import { expect, test } from 'bun:test';
import { TestContext } from '../../../__tests__/context';

const newBucketPermission: Partial<TBucketPermission> = {
  bucketId: 1,
  userId: 1,
  permission: BucketPermission.OWNER
};

test('Create new bucket permission', async () => {
  const response = await fetch(`${TestContext.baseUrl}/bucket_permissions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TestContext.loginTokens[1]}`
    },
    body: JSON.stringify(newBucketPermission)
  });

  expect(response.ok).toBe(true);
  expect(response.status).toBe(200);

  const { bucketPermissionId } = await response.json();

  expect(bucketPermissionId).toBeDefined();
  expect(bucketPermissionId).toBeGreaterThan(0);
});

test('No authentication tries to create bucket permission', async () => {
  const response = await fetch(`${TestContext.baseUrl}/bucket_permissions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(newBucketPermission)
  });

  expect(response.ok).toBe(false);
  expect(response.status).toBe(401);
});

test('User needs higher role to create bucket permission', async () => {
  const response = await fetch(`${TestContext.baseUrl}/bucket_permissions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TestContext.loginTokens[2]}`
    },
    body: JSON.stringify(newBucketPermission)
  });

  expect(response.ok).toBe(false);
  expect(response.status).toBe(403);
});

test('New bucket permission for non existing bucket', async () => {
  const wrongDataPermission: Partial<TBucketPermission> = {
    bucketId: 999999999,
    userId: 1,
    permission: BucketPermission.OWNER
  };

  const response = await fetch(`${TestContext.baseUrl}/bucket_permissions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TestContext.loginTokens[1]}`
    },
    body: JSON.stringify(wrongDataPermission)
  });

  const { errors } = await response.json();

  expect(response.ok).toBe(false);
  expect(response.status).toBe(404);
  expect(errors).toBeDefined();
  expect(errors.bucketId).toBeDefined();
});

test('New bucket permission for non existing user', async () => {
  const wrongDataPermission: Partial<TBucketPermission> = {
    bucketId: 1,
    userId: 999999999,
    permission: BucketPermission.OWNER
  };

  const response = await fetch(`${TestContext.baseUrl}/bucket_permissions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TestContext.loginTokens[1]}`
    },
    body: JSON.stringify(wrongDataPermission)
  });

  const { errors } = await response.json();

  expect(response.ok).toBe(false);
  expect(response.status).toBe(404);
  expect(errors).toBeDefined();
  expect(errors.userId).toBeDefined();
});

test('New bucket permission with invalid permission', async () => {
  const wrongDataPermission: Partial<TBucketPermission> = {
    bucketId: 1,
    userId: 1,
    permission: 'should_not_work' as BucketPermission
  };

  const response = await fetch(`${TestContext.baseUrl}/bucket_permissions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TestContext.loginTokens[1]}`
    },
    body: JSON.stringify(wrongDataPermission)
  });

  const { errors } = await response.json();

  expect(response.ok).toBe(false);
  expect(response.status).toBe(400);
  expect(errors).toBeDefined();
  expect(errors.permission).toBeDefined();
});
