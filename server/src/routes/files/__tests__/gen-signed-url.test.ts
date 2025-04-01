import { expect, test } from 'bun:test';
import { TestContext } from '../../../__tests__/context';

test('Tries to generate signed url', async () => {
  const response = await fetch(`${TestContext.baseUrl}/files/sign-url`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TestContext.loginTokens[1]}`
    },
    body: JSON.stringify({
      bucketId: 1,
      fileName: 'welcome.txt',
      expiresInSeconds: 3600
    })
  });

  expect(response.ok).toBe(true);
  expect(response.status).toBe(200);

  const { signedUrl } = await response.json();

  expect(signedUrl).toBeDefined();
});

test('Unauthenticated user tries to generate signed url', async () => {
  const response = await fetch(`${TestContext.baseUrl}/files/sign-url`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      bucketId: 1,
      fileName: 'welcome.txt',
      expiresInSeconds: 3600
    })
  });

  expect(response.ok).toBe(false);
  expect(response.status).toBe(401);
});

test('User with no read permission tries to generate signed url', async () => {
  const response = await fetch(`${TestContext.baseUrl}/files/sign-url`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TestContext.loginTokens[4]}`
    },
    body: JSON.stringify({
      bucketId: 1,
      fileName: 'welcome.txt',
      expiresInSeconds: 3600
    })
  });

  expect(response.ok).toBe(false);
  expect(response.status).toBe(403);
});

test('User tries to generate signed url for non-existing file', async () => {
  const response = await fetch(`${TestContext.baseUrl}/files/sign-url`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TestContext.loginTokens[1]}`
    },
    body: JSON.stringify({
      bucketId: 1,
      fileName: 'non-existing-file.txt',
      expiresInSeconds: 3600
    })
  });

  expect(response.ok).toBe(false);
  expect(response.status).toBe(404);
});

test('User tries to generate signed url for non-existing bucket', async () => {
  const response = await fetch(`${TestContext.baseUrl}/files/sign-url`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TestContext.loginTokens[1]}`
    },
    body: JSON.stringify({
      bucketId: 999,
      fileName: 'welcome.txt',
      expiresInSeconds: 3600
    })
  });

  expect(response.ok).toBe(false);
  expect(response.status).toBe(404);
});
