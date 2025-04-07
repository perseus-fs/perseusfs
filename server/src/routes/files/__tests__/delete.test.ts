import { beforeEach, expect, test } from 'bun:test';
import { TestContext } from '../../../__tests__/context';

let fileId: number | bigint;

beforeEach(() => {
  fileId = TestContext.ensureFile('new-file.txt', 1).id;
});

test('Delete file', async () => {
  const response = await fetch(`${TestContext.baseUrl}/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TestContext.loginTokens[1]}`
    }
  });

  expect(response.ok).toBe(true);
  expect(response.status).toBe(200);
});

test('No authentication tries to delete file', async () => {
  const response = await fetch(`${TestContext.baseUrl}/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  expect(response.ok).toBe(false);
  expect(response.status).toBe(401);
});

test('User with no write permission tries to delete file', async () => {
  const response = await fetch(`${TestContext.baseUrl}/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TestContext.loginTokens[3]}`
    }
  });

  expect(response.ok).toBe(false);
  expect(response.status).toBe(403);
});

test('User with write permission tries to delete file', async () => {
  const response = await fetch(`${TestContext.baseUrl}/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TestContext.loginTokens[4]}`
    }
  });

  expect(response.ok).toBe(true);
  expect(response.status).toBe(200);
});

test('Owner tries to delete file', async () => {
  const response = await fetch(`${TestContext.baseUrl}/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TestContext.loginTokens[5]}`
    }
  });

  expect(response.ok).toBe(true);
  expect(response.status).toBe(200);
});

test('Tries to delete file that does not exist', async () => {
  const response = await fetch(`${TestContext.baseUrl}/files/999999999`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TestContext.loginTokens[1]}`
    }
  });

  expect(response.ok).toBe(false);
  expect(response.status).toBe(404);
});
