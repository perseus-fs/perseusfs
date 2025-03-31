import { expect, test } from 'bun:test';
import { TestContext } from '../../../__tests__/context';

test('List buckets', async () => {
  const response = await fetch(`${TestContext.baseUrl}/buckets`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TestContext.loginTokens[1]}`
    }
  });

  expect(response.ok).toBe(true);

  const { buckets } = await response.json();

  expect(response.status).toBe(200);
  expect(buckets).toBeDefined();
  expect(buckets.length).toBeGreaterThan(0);
});

test('No authentication tries to list buckets', async () => {
  const response = await fetch(`${TestContext.baseUrl}/buckets`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  expect(response.ok).toBe(false);
  expect(response.status).toBe(401);
});
