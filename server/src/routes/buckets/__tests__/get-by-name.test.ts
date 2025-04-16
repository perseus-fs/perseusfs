import { expect, test } from 'bun:test';
import { TestContext } from '../../../__tests__/context';

test('Get bucket by name', async () => {
  console.debug('puta', `${TestContext.baseUrl}/buckets/by-name/bucket-4`);

  const response = await fetch(
    `${TestContext.baseUrl}/buckets/by-name/bucket-4`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TestContext.loginTokens[1]}`
      }
    }
  );

  expect(response.ok).toBe(true);

  const { bucket } = await response.json();

  expect(response.status).toBe(200);
  expect(bucket).toBeDefined();
  expect(bucket.id).toBe(4);
});

test('No authentication tries to get bucket by name', async () => {
  const response = await fetch(
    `${TestContext.baseUrl}/buckets/by-name/bucket-4`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );

  expect(response.ok).toBe(false);
  expect(response.status).toBe(401);
});

test('User with no access to bucket tries to get bucket by name', async () => {
  const response = await fetch(
    `${TestContext.baseUrl}/buckets/by-name/bucket-2`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TestContext.loginTokens[2]}`
      }
    }
  );

  expect(response.ok).toBe(false);
  expect(response.status).toBe(403);
});

test('User with access to bucket tries to get bucket by name', async () => {
  const response = await fetch(
    `${TestContext.baseUrl}/buckets/by-name/my-bucket`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TestContext.loginTokens[2]}`
      }
    }
  );

  expect(response.ok).toBe(true);
  expect(response.status).toBe(200);

  const { bucket, files, userPermissions } = await response.json();

  expect(bucket).toBeDefined();
  expect(bucket.id).toBe(1);
  expect(files).toBeDefined();
  expect(files.length).toBe(1);
  expect(userPermissions).toBeDefined();
  expect(userPermissions.readPermission).toBe(true);
  expect(userPermissions.writePermission).toBe(false);
  expect(userPermissions.managePermission).toBe(false);
  expect(userPermissions.isOwner).toBe(false);
});

test('Owner tries to get bucket by name', async () => {
  const response = await fetch(
    `${TestContext.baseUrl}/buckets/by-name/bucket-2`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TestContext.loginTokens[3]}`
      }
    }
  );

  expect(response.ok).toBe(true);
  expect(response.status).toBe(200);

  const { bucket, files, userPermissions } = await response.json();

  expect(bucket).toBeDefined();
  expect(bucket.id).toBe(2);
  expect(files).toBeDefined();
  expect(files.length).toBe(1);
  expect(userPermissions).toBeDefined();
  expect(userPermissions.readPermission).toBe(true);
  expect(userPermissions.writePermission).toBe(true);
  expect(userPermissions.managePermission).toBe(true);
  expect(userPermissions.isOwner).toBe(true);
});

test('Bucket does not exist', async () => {
  const response = await fetch(
    `${TestContext.baseUrl}/buckets/by-name/idontexist`,
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
