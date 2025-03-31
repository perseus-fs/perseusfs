import { UserRole, type TUser } from '@perseusfs/shared';
import { beforeEach, expect, test } from 'bun:test';
import { TestContext } from '../../../__tests__/context';

const newUser: Partial<TUser> = {
  name: 'new-user',
  role: UserRole.USER,
  password: 'password',
  email: 'email@test.com'
};

let userId: number;

beforeEach(() => {
  userId = TestContext.ensureUser(newUser).id;
});

test('Delete user', async () => {
  const response = await fetch(`${TestContext.baseUrl}/users/${userId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TestContext.loginTokens[1]}`
    }
  });

  expect(response.ok).toBe(true);
  expect(response.status).toBe(200);
});

test('No authentication tries to delete user', async () => {
  const response = await fetch(`${TestContext.baseUrl}/users/${userId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  expect(response.ok).toBe(false);
  expect(response.status).toBe(401);
});

test('User needs higher role to delete user', async () => {
  const response = await fetch(`${TestContext.baseUrl}/users/${userId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TestContext.loginTokens[2]}`
    }
  });

  expect(response.ok).toBe(false);
  expect(response.status).toBe(403);
});

test('Tries to delete user that does not exist', async () => {
  const response = await fetch(`${TestContext.baseUrl}/users/999999999`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TestContext.loginTokens[1]}`
    }
  });

  expect(response.ok).toBe(false);
  expect(response.status).toBe(404);
});
