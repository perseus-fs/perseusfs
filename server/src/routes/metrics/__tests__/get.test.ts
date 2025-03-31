import { expect, test } from 'bun:test';
import { TestContext } from '../../../__tests__/context';

test.skip('Get metrics', async () => {
  const response = await fetch(`${TestContext.baseUrl}/metrics`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TestContext.loginTokens[1]}`
    }
  });

  expect(response.ok).toBe(true);

  const { metrics } = await response.json();

  expect(response.status).toBe(200);
  expect(metrics).toBeDefined();
});

test('No authentication tries to get metrics', async () => {
  const response = await fetch(`${TestContext.baseUrl}/metrics`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  expect(response.ok).toBe(false);
  expect(response.status).toBe(401);
});

test('User needs higher role to get metrics', async () => {
  const response = await fetch(`${TestContext.baseUrl}/metrics`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TestContext.loginTokens[2]}`
    }
  });

  expect(response.ok).toBe(false);
  expect(response.status).toBe(403);
});
