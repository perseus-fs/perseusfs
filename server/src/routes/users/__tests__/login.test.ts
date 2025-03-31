import { expect, test } from 'bun:test';
import { TestContext } from '../../../__tests__/context';

test('Login with default user', async () => {
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

  const { token } = await response.json();

  expect(response.status).toBe(200);
  expect(token).toBeDefined();
});

test('Login with wrong password', async () => {
  const response = await fetch(`${TestContext.baseUrl}/users/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: 'admin',
      password: 'wrong-password'
    })
  });

  expect(response.ok).toBe(false);

  const { errors, token } = await response.json();

  expect(response.status).toBe(401);
  expect(token).toBeUndefined();
  expect(errors).toBeDefined();
  expect(errors.password).toBeDefined();
});

test('Login with non-existing user', async () => {
  const response = await fetch(`${TestContext.baseUrl}/users/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: 'non-existing-user',
      password: 'password'
    })
  });

  expect(response.ok).toBe(false);

  const { errors, token } = await response.json();

  expect(response.status).toBe(401);
  expect(token).toBeUndefined();
  expect(errors).toBeDefined();
  expect(errors.username).toBeDefined();
  expect(Object.keys(errors).length).toBe(1);
});

test('Login with no user/password', async () => {
  const response = await fetch(`${TestContext.baseUrl}/users/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({})
  });

  expect(response.ok).toBe(false);

  const { errors, token } = await response.json();

  expect(response.status).toBe(401);
  expect(token).toBeUndefined();
  expect(errors).toBeDefined();
  expect(errors.username).toBeDefined();
  expect(errors.password).toBeDefined();
  expect(Object.keys(errors).length).toBe(2);
});
