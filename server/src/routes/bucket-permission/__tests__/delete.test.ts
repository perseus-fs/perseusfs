import { BucketPermission, type TBucketPermission } from '@perseusfs/shared';
import { beforeEach, expect, test } from 'bun:test';
import { TestContext } from '../../../__tests__/context';

const newBucketPermission: Partial<TBucketPermission> = {
  bucketId: 1,
  userId: 1,
  permission: BucketPermission.OWNER
};

let permissionId: number;

beforeEach(() => {
  permissionId = TestContext.ensureBucketPermission(newBucketPermission)?.id;
});

test('Delete bucket permission', async () => {
  const response = await fetch(
    `${TestContext.baseUrl}/bucket_permissions/${permissionId}`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TestContext.loginTokens[1]}`
      }
    }
  );

  expect(response.ok).toBe(true);
  expect(response.status).toBe(200);
});

test('No authentication tries to delete bucket permission', async () => {
  const response = await fetch(
    `${TestContext.baseUrl}/bucket_permissions/${permissionId}`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );

  expect(response.ok).toBe(false);
  expect(response.status).toBe(401);
});

test('User needs higher role to delete bucket permission', async () => {
  const response = await fetch(
    `${TestContext.baseUrl}/bucket_permissions/${permissionId}`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TestContext.loginTokens[2]}`
      }
    }
  );

  expect(response.ok).toBe(false);
  expect(response.status).toBe(403);
});

test('Tries to delete non existing bucket permission', async () => {
  const response = await fetch(
    `${TestContext.baseUrl}/bucket_permissions/999999999`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TestContext.loginTokens[1]}`
      }
    }
  );

  expect(response.ok).toBe(false);
  expect(response.status).toBe(404);
});
