import { FileHeader, IOPermission, SettingKey } from '@perseusfs/shared';
import { expect, test } from 'bun:test';
import { TestContext } from '../../../__tests__/context';
import { Bucket } from '../../../database/models/bucket';
import { Settings } from '../../../database/models/settings';

const MOCK_FILE = TestContext.getStringAsArrayBuffer(5000); // 5KB

test('Unauthenticated user tries to upload file to private write bucket', async () => {
  const response = await fetch(`${TestContext.baseUrl}/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
      [FileHeader.FILENAME]: 'test.txt',
      [FileHeader.BUCKET_ID]: '1'
    },
    body: MOCK_FILE
  });

  expect(response.ok).toBe(false);
  expect(response.status).toBe(401);
});

test('User with no write permission tries to upload file to private write file', async () => {
  const response = await fetch(`${TestContext.baseUrl}/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
      [FileHeader.FILENAME]: 'test.txt',
      [FileHeader.BUCKET_ID]: '1',
      Authorization: `Bearer ${TestContext.loginTokens[2]}`
    },
    body: MOCK_FILE
  });

  expect(response.ok).toBe(false);
  expect(response.status).toBe(403);
});

test('User with write permission tries to upload file to private write file', async () => {
  const response = await fetch(`${TestContext.baseUrl}/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
      [FileHeader.FILENAME]: 'test.txt',
      [FileHeader.BUCKET_ID]: '2',
      Authorization: `Bearer ${TestContext.loginTokens[4]}`
    },
    body: MOCK_FILE
  });

  expect(response.ok).toBe(true);
  expect(response.status).toBe(200);

  const { fileName, fileId, currentPath } = await response.json();

  expect(fileName).toBeDefined();
  expect(fileId).toBeDefined();
  expect(currentPath).toBeDefined();
  expect(fileName).toBe('test.txt');
  expect(currentPath).toBe('bucket-2/test.txt');
});

test('Unauthenticated user tries to upload file to public write bucket', async () => {
  const response = await fetch(`${TestContext.baseUrl}/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
      [FileHeader.FILENAME]: 'test.txt',
      [FileHeader.BUCKET_ID]: '2'
    },
    body: MOCK_FILE
  });

  expect(response.ok).toBe(true);
  expect(response.status).toBe(200);
});

test('Tries to upload file to non-existent bucket', async () => {
  const response = await fetch(`${TestContext.baseUrl}/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
      [FileHeader.FILENAME]: 'test.txt',
      [FileHeader.BUCKET_ID]: '999999999',
      Authorization: `Bearer ${TestContext.loginTokens[1]}`
    },
    body: MOCK_FILE
  });

  expect(response.ok).toBe(false);
  expect(response.status).toBe(404);
});

test('Tries to upload the file twice (they do not collide)', async () => {
  const response1 = await fetch(`${TestContext.baseUrl}/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
      [FileHeader.FILENAME]: 'test.txt',
      [FileHeader.BUCKET_ID]: '1',
      Authorization: `Bearer ${TestContext.loginTokens[1]}`
    },
    body: MOCK_FILE
  });

  expect(response1.ok).toBe(true);
  expect(response1.status).toBe(200);

  const {
    currentPath: currentPath1,
    fileName: fileName1,
    fileId: fileId1
  } = await response1.json();

  expect(currentPath1).toBeDefined();
  expect(fileName1).toBeDefined();
  expect(fileId1).toBeDefined();

  const response2 = await fetch(`${TestContext.baseUrl}/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
      [FileHeader.FILENAME]: 'test.txt',
      [FileHeader.BUCKET_ID]: '1',
      Authorization: `Bearer ${TestContext.loginTokens[1]}`
    },
    body: MOCK_FILE
  });

  expect(response2.ok).toBe(true);
  expect(response2.status).toBe(200);

  const {
    currentPath: currentPath2,
    fileName: fileName2,
    fileId: fileId2
  } = await response2.json();

  expect(currentPath2).toBeDefined();
  expect(fileName2).toBeDefined();
  expect(fileId2).toBeDefined();

  expect(currentPath1).not.toBe(currentPath2);
  expect(fileName1).not.toBe(fileName2);
  expect(fileId1).not.toBe(fileId2);
});

test('Tries to upload file that exceeds global max disk usage', async () => {
  Settings.set(SettingKey.MAX_DISK_USAGE, 1000000); // 1MB

  const response = await fetch(`${TestContext.baseUrl}/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
      [FileHeader.FILENAME]: 'too-big.txt',
      [FileHeader.BUCKET_ID]: '1',
      Authorization: `Bearer ${TestContext.loginTokens[1]}`
    },
    body: TestContext.getStringAsArrayBuffer(2000000) // 2MB
  });

  expect(response.ok).toBe(false);
  expect(response.status).toBe(500);
});

test('Tries to upload file that exceeds bucket disk usage', async () => {
  const response = await fetch(`${TestContext.baseUrl}/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
      [FileHeader.FILENAME]: 'too-big.txt',
      [FileHeader.BUCKET_ID]: '3',
      Authorization: `Bearer ${TestContext.loginTokens[1]}`
    },
    body: TestContext.getStringAsArrayBuffer(2000000) // 2MB
  });

  expect(response.ok).toBe(false);
  expect(response.status).toBe(500);
});

test('Tries to upload file and fails with simple custom write permissions that returns false', async () => {
  Bucket.update(3, {
    write: IOPermission.CUSTOM,
    customWrite: `async (req, fileName, bucket) => {
      return false;
    }`
  });

  const response = await fetch(`${TestContext.baseUrl}/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
      [FileHeader.FILENAME]: 'test.txt',
      [FileHeader.BUCKET_ID]: '3',
      Authorization: `Bearer ${TestContext.loginTokens[1]}`
    },
    body: MOCK_FILE
  });

  expect(response.ok).toBe(false);
  expect(response.status).toBe(403);
});

test('Tries to upload file and succeeds with simple custom write permissions that returns true', async () => {
  Bucket.update(3, {
    write: IOPermission.CUSTOM,
    customWrite: `async (req, fileName, bucket) => {
      return true;
    }`
  });

  const response = await fetch(`${TestContext.baseUrl}/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
      [FileHeader.FILENAME]: 'test.txt',
      [FileHeader.BUCKET_ID]: '3',
      Authorization: `Bearer ${TestContext.loginTokens[1]}`
    },
    body: MOCK_FILE
  });

  expect(response.ok).toBe(true);
  expect(response.status).toBe(200);
});

test('Custom write permissions: checks header value', async () => {
  Bucket.update(3, {
    write: IOPermission.CUSTOM,
    customWrite: `async (req, fileName, bucket) => {
      const testHeader = req.headers.get('X-Test-Header');

      if(testHeader === 'my-value') {
        return true;
      }

      return false;
    }`
  });

  const response = await fetch(`${TestContext.baseUrl}/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
      [FileHeader.FILENAME]: 'test.txt',
      [FileHeader.BUCKET_ID]: '3',
      Authorization: `Bearer ${TestContext.loginTokens[1]}`,
      'X-Test-Header': 'my-value'
    },
    body: MOCK_FILE
  });

  expect(response.ok).toBe(true);
  expect(response.status).toBe(200);
});

test('Custom write permissions: checks file name', async () => {
  Bucket.update(3, {
    write: IOPermission.CUSTOM,
    customWrite: `async (req, fileName, bucket) => {
      if(fileName === 'test.txt') {
        return true;
      }

      return false;
    }`
  });

  const response = await fetch(`${TestContext.baseUrl}/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
      [FileHeader.FILENAME]: 'heyyyyyy.txt',
      [FileHeader.BUCKET_ID]: '3',
      Authorization: `Bearer ${TestContext.loginTokens[1]}`
    },
    body: MOCK_FILE
  });

  expect(response.ok).toBe(false);
  expect(response.status).toBe(403);
});

test('Custom write permissions: do not allow if bucket is called tasbemmene', async () => {
  Bucket.update(3, {
    name: 'tasbemmene',
    write: IOPermission.CUSTOM,
    customWrite: `async (req, fileName, bucket) => {
      if(bucket.name === 'tasbemmene') {
        return false;
      }

      return false;
    }`
  });

  const response = await fetch(`${TestContext.baseUrl}/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
      [FileHeader.FILENAME]: 'heyyyyyy.txt',
      [FileHeader.BUCKET_ID]: '3',
      Authorization: `Bearer ${TestContext.loginTokens[1]}`
    },
    body: MOCK_FILE
  });

  expect(response.ok).toBe(false);
  expect(response.status).toBe(403);
});

test('Custom write permissions: allow if user is logged in', async () => {
  Bucket.update(3, {
    name: 'tasbemmene',
    write: IOPermission.CUSTOM,
    customWrite: `async (req, fileName, bucket) => {
      return !!req.user;
    }`
  });

  const response = await fetch(`${TestContext.baseUrl}/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
      [FileHeader.FILENAME]: 'heyyyyyy.txt',
      [FileHeader.BUCKET_ID]: '3',
      Authorization: `Bearer ${TestContext.loginTokens[1]}`
    },
    body: MOCK_FILE
  });

  expect(response.ok).toBe(true);
  expect(response.status).toBe(200);
});

test('Custom write permissions: block if user is not logged in', async () => {
  Bucket.update(3, {
    name: 'tasbemmene',
    write: IOPermission.CUSTOM,
    customWrite: `async (req, fileName, bucket) => {
      return !!req.user;
    }`
  });

  const response = await fetch(`${TestContext.baseUrl}/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
      [FileHeader.FILENAME]: 'heyyyyyy.txt',
      [FileHeader.BUCKET_ID]: '3'
    },
    body: MOCK_FILE
  });

  expect(response.ok).toBe(false);
  expect(response.status).toBe(403);
});
