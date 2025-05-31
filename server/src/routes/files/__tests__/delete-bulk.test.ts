import { beforeEach, expect, test } from 'bun:test';
import { TestContext } from '../../../__tests__/context';

let fileIds: (number | bigint)[];

beforeEach(() => {
  fileIds = [
    TestContext.ensureFile('new-file.txt', 1).id,
    TestContext.ensureFile('another-file.txt', 1).id,
    TestContext.ensureFile('third-file.txt', 1).id,
    TestContext.ensureFile('fourth-file.txt', 1).id
  ];
});

test('Delete files', async () => {
  const response = await fetch(`${TestContext.baseUrl}/files`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TestContext.loginTokens[1]}`
    },
    body: JSON.stringify({ fileIds })
  });

  expect(response.ok).toBe(true);
  expect(response.status).toBe(200);
});

test('No authentication tries to delete files', async () => {
  const response = await fetch(`${TestContext.baseUrl}/files`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ fileIds })
  });

  expect(response.ok).toBe(false);
  expect(response.status).toBe(401);
});

test('User with no write permission tries to delete files', async () => {
  const response = await fetch(`${TestContext.baseUrl}/files`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TestContext.loginTokens[3]}`
    },
    body: JSON.stringify({ fileIds })
  });

  expect(response.ok).toBe(false);
  expect(response.status).toBe(403);
});

test('User with write permission tries to delete files', async () => {
  const response = await fetch(`${TestContext.baseUrl}/files`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TestContext.loginTokens[4]}`
    },
    body: JSON.stringify({ fileIds })
  });

  expect(response.ok).toBe(true);
  expect(response.status).toBe(200);
});

test('Owner tries to delete files', async () => {
  const response = await fetch(`${TestContext.baseUrl}/files`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TestContext.loginTokens[5]}`
    },
    body: JSON.stringify({ fileIds })
  });

  expect(response.ok).toBe(true);
  expect(response.status).toBe(200);
});

test('Tries to delete files that do not exist', async () => {
  const response = await fetch(`${TestContext.baseUrl}/files`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TestContext.loginTokens[1]}`
    },
    body: JSON.stringify({ fileIds: [999999999, 88437778] })
  });

  expect(response.ok).toBe(false);
  expect(response.status).toBe(404);
});
