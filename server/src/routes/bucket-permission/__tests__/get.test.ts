import { BucketPermission } from '@perseusfs/shared';
import { expect, test } from 'bun:test';
import { TestContext } from '../../../__tests__/context';

test.only('Get bucket permission', async () => {
  const response = await fetch(`${TestContext.baseUrl}/bucket_permissions/1`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TestContext.loginTokens[1]}`
    }
  });

  expect(response.ok).toBe(true);
  expect(response.status).toBe(200);

  const { bucketPermission } = await response.json();

  expect(bucketPermission).toBeDefined();
  expect(bucketPermission.id).toBe(1);
  expect(bucketPermission.permission).toBe(BucketPermission.READ);
  expect(bucketPermission.userId).toBe(2);
  expect(bucketPermission.bucketId).toBe(1);
  expect(bucketPermission._user).toBeDefined();
  expect(bucketPermission._user).toBeObject();
});

test('No authentication tries to get bucket permission', async () => {
  const response = await fetch(`${TestContext.baseUrl}/bucket_permissions/1`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  expect(response.ok).toBe(false);
  expect(response.status).toBe(401);
});

test('User needs higher role to get bucket permission', async () => {
  const response = await fetch(`${TestContext.baseUrl}/bucket_permissions/1`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TestContext.loginTokens[2]}`
    }
  });

  expect(response.ok).toBe(false);
  expect(response.status).toBe(403);
});

test('Get non existing bucket permission', async () => {
  const response = await fetch(
    `${TestContext.baseUrl}/bucket_permissions/999999999`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TestContext.loginTokens[1]}`
      }
    }
  );

  expect(response.ok).toBe(false);
  expect(response.status).toBe(404);
});
