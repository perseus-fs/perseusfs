import { UserRole, type TUser } from '@perseusfs/shared';
import { beforeEach, expect, test } from 'bun:test';
import { TestContext } from '../../../__tests__/context';
import { User } from '../../../database/models/user';

const targetUser: Partial<TUser> = {
  name: 'target-user',
  role: UserRole.USER,
  password: 'password',
  email: 'target@test.com'
};

let userId: number;

beforeEach(() => {
  userId = TestContext.ensureUser(targetUser).id;
});

test('Update user', async () => {
  const newData: Partial<TUser> = {
    name: 'new-name',
    role: UserRole.ADMIN,
    password: 'new-password',
    email: 'a-new-email@test.com'
  };

  const response = await fetch(`${TestContext.baseUrl}/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TestContext.loginTokens[1]}`
    },
    body: JSON.stringify(newData)
  });

  expect(response.ok).toBe(true);
  expect(response.status).toBe(200);

  const dbUser = User.findById(userId);

  expect(dbUser).toBeDefined();
  expect(dbUser?.id).toBe(userId);
  expect(dbUser?.name).toBe(newData.name!);
  expect(dbUser?.role).toBe(newData.role!);
  expect(dbUser?.email).toBe(newData.email!);
});

test('No authentication tries to update user', async () => {
  const response = await fetch(`${TestContext.baseUrl}/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: 'not-gonna-work'
    })
  });

  expect(response.ok).toBe(false);
  expect(response.status).toBe(401);
});

test('User needs higher role to update user', async () => {
  const response = await fetch(`${TestContext.baseUrl}/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TestContext.loginTokens[2]}`
    },
    body: JSON.stringify({
      name: 'not-gonna-work'
    })
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

  const response = await fetch(`${TestContext.baseUrl}/users/${userId}`, {
    method: 'PUT',
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
