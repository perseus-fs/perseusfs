import { UserRole, type TUser } from '@perseusfs/shared';
import { expect, test } from 'bun:test';
import { TestContext } from '../../../__tests__/context';

const newUser: Partial<TUser> = {
  name: 'new-user',
  role: UserRole.USER,
  password: 'password',
  email: 'email@test.com'
};

test('Create user', async () => {
  const response = await fetch(`${TestContext.baseUrl}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TestContext.loginTokens[1]}`
    },
    body: JSON.stringify(newUser)
  });

  expect(response.ok).toBe(true);
  expect(response.status).toBe(200);

  const { userId } = await response.json();

  expect(userId).toBeDefined();
  expect(userId).toBeGreaterThan(0);
});

test('No authentication tries to create user', async () => {
  const response = await fetch(`${TestContext.baseUrl}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(newUser)
  });

  expect(response.ok).toBe(false);
  expect(response.status).toBe(401);
});

test('User needs higher role to create user', async () => {
  const response = await fetch(`${TestContext.baseUrl}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TestContext.loginTokens[2]}`
    },
    body: JSON.stringify(newUser)
  });

  expect(response.ok).toBe(false);
  expect(response.status).toBe(403);
});

test('New user data is being validated', async () => {
  const wrongUser: Partial<TUser> = {
    name: '',
    role: 'invalid-role' as UserRole,
    password: 'a',
    email: 'not-an-email'
  };

  const response = await fetch(`${TestContext.baseUrl}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TestContext.loginTokens[1]}`
    },
    body: JSON.stringify(wrongUser)
  });

  const { errors } = await response.json();

  expect(response.ok).toBe(false);
  expect(response.status).toBe(400);
  expect(errors).toBeDefined();
  expect(errors.name).toBeDefined();
  expect(errors.role).toBeDefined();
  expect(errors.password).toBeDefined();
  expect(errors.email).toBeDefined();
  expect(Object.keys(errors).length).toBe(4);
});
