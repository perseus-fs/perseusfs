import { expect, test } from 'bun:test';
import { TestContext } from '../../../__tests__/context';

test('List request logs', async () => {
  const response = await fetch(`${TestContext.baseUrl}/request_logs`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TestContext.loginTokens[1]}`
    }
  });

  expect(response.ok).toBe(true);

  const { logs } = await response.json();

  expect(response.status).toBe(200);
  expect(logs).toBeDefined();
  expect(logs).toBeArray();
});

test('No authentication tries to list request logs', async () => {
  const response = await fetch(`${TestContext.baseUrl}/request_logs`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  expect(response.ok).toBe(false);
  expect(response.status).toBe(401);
});

test('User needs higher role to list request logs', async () => {
  const response = await fetch(`${TestContext.baseUrl}/request_logs`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TestContext.loginTokens[2]}`
    }
  });

  expect(response.ok).toBe(false);
  expect(response.status).toBe(403);
});
