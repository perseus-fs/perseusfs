import { FileHeader } from '@perseusfs/shared';
import { expect, test } from 'bun:test';
import { TestContext } from '../../../__tests__/context';

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
  console.debug(`${TestContext.baseUrl}/upload`);

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
    finalPath: finalPath1,
    fileName: fileName1,
    fileId: fileId1
  } = await response1.json();

  expect(finalPath1).toBeDefined();
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
    finalPath: finalPath2,
    fileName: fileName2,
    fileId: fileId2
  } = await response2.json();

  expect(finalPath2).toBeDefined();
  expect(fileName2).toBeDefined();
  expect(fileId2).toBeDefined();

  expect(finalPath1).not.toBe(finalPath2);
  expect(fileName1).not.toBe(fileName2);
  expect(fileId1).not.toBe(fileId2);
});

// add custom read & write permissions tests