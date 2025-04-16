import {
  BucketPermission as EBucketPermission,
  type TBucketPermission
} from '@perseusfs/shared';
import { beforeEach, expect, test } from 'bun:test';
import { TestContext } from '../../../__tests__/context';
import { BucketPermission } from '../../../database/models/bucket-permission';

const targetBucketPermission: Partial<TBucketPermission> = {
  bucketId: 6,
  userId: 5,
  permission: EBucketPermission.READ_WRITE
};

let bucketPermissionId: number;

beforeEach(() => {
  bucketPermissionId = TestContext.ensureBucketPermission(
    targetBucketPermission
  ).id;
});

test('Update bucket permission', async () => {
  const newData: Partial<TBucketPermission> = {
    bucketId: 6,
    userId: 5,
    permission: EBucketPermission.READ
  };

  const response = await fetch(
    `${TestContext.baseUrl}/bucket_permissions/${bucketPermissionId}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TestContext.loginTokens[1]}`
      },
      body: JSON.stringify(newData)
    }
  );

  expect(response.ok).toBe(true);
  expect(response.status).toBe(200);

  const dbBucketPermission = BucketPermission.findById(bucketPermissionId);

  expect(dbBucketPermission).toBeDefined();
  expect(dbBucketPermission?.id).toBe(bucketPermissionId);
  expect(dbBucketPermission?.bucketId).toBe(newData.bucketId!);
  expect(dbBucketPermission?.userId).toBe(newData.userId!);
  expect(dbBucketPermission?.permission).toBe(newData.permission!);
});

test('No authentication tries to update bucket permission', async () => {
  const response = await fetch(
    `${TestContext.baseUrl}/bucket_permissions/${bucketPermissionId}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        permission: 'not-gonna-work'
      })
    }
  );

  expect(response.ok).toBe(false);
  expect(response.status).toBe(401);
});

test('User needs higher role to update bucket permission', async () => {
  const response = await fetch(
    `${TestContext.baseUrl}/bucket_permissions/${bucketPermissionId}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TestContext.loginTokens[2]}`
      },
      body: JSON.stringify({
        permission: 'not-gonna-work'
      })
    }
  );

  expect(response.ok).toBe(false);
  expect(response.status).toBe(403);
});

test('New bucket permission data is being validated', async () => {
  const wrongPermission: Partial<TBucketPermission> = {
    permission: 'invalid-permission' as EBucketPermission
  };

  const response = await fetch(
    `${TestContext.baseUrl}/bucket_permissions/${bucketPermissionId}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TestContext.loginTokens[1]}`
      },
      body: JSON.stringify(wrongPermission)
    }
  );

  const { errors } = await response.json();

  expect(response.ok).toBe(false);
  expect(response.status).toBe(400);
  expect(errors).toBeDefined();
  expect(errors.permission).toBeDefined();
  expect(Object.keys(errors).length).toBe(1);
});
