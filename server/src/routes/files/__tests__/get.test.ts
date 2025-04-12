import { getRandomString } from '@perseusfs/shared';
import { sleep } from 'bun';
import { expect, test } from 'bun:test';
import { TestContext } from '../../../__tests__/context';
import { DEFAULT_FILE_CONTENT } from '../../../database/db';
import { File } from '../../../database/models/file';

test('Get default file', async () => {
  const response = await fetch(`${TestContext.baseUrl}/my-bucket/welcome.txt`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TestContext.loginTokens[1]}`
    }
  });

  expect(response.ok).toBe(true);
  expect(response.status).toBe(200);

  const text = await response.text();

  expect(text).toBe(DEFAULT_FILE_CONTENT);
});

test('File does not exist in bucket', async () => {
  const response = await fetch(
    `${TestContext.baseUrl}/my-bucket/nonexistent.txt`,
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

test('Bucket does not exist', async () => {
  const response = await fetch(
    `${TestContext.baseUrl}/nonexistent-bucket/welcome.txt`,
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

test('Unauthenticated user tries to read from public read bucket', async () => {
  const response = await fetch(`${TestContext.baseUrl}/my-bucket/welcome.txt`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  expect(response.ok).toBe(true);
  expect(response.status).toBe(200);
});

test('Unauthenticated user tries to read from private read bucket', async () => {
  const response = await fetch(`${TestContext.baseUrl}/bucket-2/private.txt`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  expect(response.ok).toBe(false);
  expect(response.status).toBe(401);
});

test('User with no read permission tries to read from private read bucket', async () => {
  const response = await fetch(`${TestContext.baseUrl}/bucket-2/private.txt`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TestContext.loginTokens[2]}`
    }
  });

  expect(response.ok).toBe(false);
  expect(response.status).toBe(403);
});

test('User with no read permission tries to read from public read bucket', async () => {
  const response = await fetch(`${TestContext.baseUrl}/my-bucket/welcome.txt`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TestContext.loginTokens[2]}`
    }
  });

  expect(response.ok).toBe(true);
  expect(response.status).toBe(200);
});

test('User with no read permission tries to read from public read bucket', async () => {
  const response = await fetch(`${TestContext.baseUrl}/my-bucket/welcome.txt`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TestContext.loginTokens[2]}`
    }
  });

  expect(response.ok).toBe(true);
  expect(response.status).toBe(200);
});

test('User with owner permission tries to read from his private read bucket', async () => {
  const response = await fetch(`${TestContext.baseUrl}/bucket-2/private.txt`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TestContext.loginTokens[3]}`
    }
  });

  expect(response.ok).toBe(true);
  expect(response.status).toBe(200);
});

test('User tries to get a file that should have been disposed', async () => {
  const { currentPath } = File.writeFile(
    TestContext.getStringAsArrayBuffer(500),
    6,
    undefined,
    `${getRandomString(16)}.txt`
  );

  await sleep(6000);

  const response = await fetch(`${TestContext.baseUrl}/${currentPath}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TestContext.loginTokens[1]}`
    }
  });

  expect(response.ok).toBe(false);
  expect(response.status).toBe(404);
});

test('User tries to get a file that is not disposable yet', async () => {
  const { currentPath } = File.writeFile(
    TestContext.getStringAsArrayBuffer(500),
    6,
    undefined,
    `${getRandomString(16)}.txt`
  );

  const response = await fetch(`${TestContext.baseUrl}/${currentPath}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TestContext.loginTokens[1]}`
    }
  });

  expect(response.ok).toBe(true);
  expect(response.status).toBe(200);
});
