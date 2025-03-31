import { expect, test } from 'bun:test';
import { TestContext } from '../../../__tests__/context';

test('List users', async () => {
  const response = await fetch(`${TestContext.baseUrl}/users`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TestContext.loginTokens[1]}`
    }
  });

  expect(response.ok).toBe(true);

  const { users } = await response.json();

  expect(response.status).toBe(200);
  expect(users).toBeDefined();
  expect(users.length).toBeGreaterThan(0);
});

test('No authentication tries to list users', async () => {
  const response = await fetch(`${TestContext.baseUrl}/users`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  expect(response.ok).toBe(false);
  expect(response.status).toBe(401);
});

test('User needs higher role to list users', async () => {
  const response = await fetch(`${TestContext.baseUrl}/users`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TestContext.loginTokens[2]}`
    }
  });

  expect(response.ok).toBe(false);
  expect(response.status).toBe(403);
});
