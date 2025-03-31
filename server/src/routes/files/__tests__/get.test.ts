import { expect, test } from 'bun:test';
import { TestContext } from '../../../__tests__/context';
import { DEFAULT_FILE_CONTENT } from '../../../database/db';

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
  // expect(response.headers.get('Content-Type')).toBe('text/plain');
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

test.only('Unauthenticated user tries to read from public read bucket', async () => {
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
