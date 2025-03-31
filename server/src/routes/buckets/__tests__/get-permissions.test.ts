import { expect, test } from 'bun:test';
import { TestContext } from '../../../__tests__/context';

test('Get permissions', async () => {
  const response = await fetch(`${TestContext.baseUrl}/buckets/1/permissions`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TestContext.loginTokens[1]}`
    }
  });

  expect(response.ok).toBe(true);
  expect(response.status).toBe(200);

  const { permissions } = await response.json();

  expect(permissions).toBeDefined();
  expect(permissions).toBeArray();
  expect(permissions.length).toBe(3);
});

test('No authentication tries to get permissions', async () => {
  const response = await fetch(`${TestContext.baseUrl}/buckets/1/permissions`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  expect(response.ok).toBe(false);
  expect(response.status).toBe(401);
});
