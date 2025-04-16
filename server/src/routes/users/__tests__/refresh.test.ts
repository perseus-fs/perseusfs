import { sleep } from 'bun';
import { expect, test } from 'bun:test';
import { TestContext } from '../../../__tests__/context';

test('Login with default user and use refresh token', async () => {
  const response = await fetch(`${TestContext.baseUrl}/users/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: 'admin',
      password: 'admin'
    })
  });

  expect(response.ok).toBe(true);

  const { token, refreshToken } = await response.json();

  expect(response.status).toBe(200);
  expect(token).toBeDefined();
  expect(refreshToken).toBeDefined();

  await sleep(3000);

  const refreshResponse = await fetch(`${TestContext.baseUrl}/users/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      refreshToken
    })
  });

  expect(refreshResponse.ok).toBe(true);
  expect(refreshResponse.status).toBe(200);

  const { token: newToken } = await refreshResponse.json();

  expect(newToken).toBeDefined();
  expect(newToken).not.toEqual(token);
  expect(newToken).not.toEqual(refreshToken);
});
