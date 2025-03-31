import { UserRole } from '@perseusfs/shared';
import { expect, test } from 'bun:test';
import { TestContext } from '../../../__tests__/context';

test('Get user', async () => {
  const response = await fetch(`${TestContext.baseUrl}/users/1`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TestContext.loginTokens[1]}`
    }
  });

  expect(response.ok).toBe(true);

  const { user } = await response.json();

  expect(response.status).toBe(200);
  expect(user).toBeDefined();
  expect(user.id).toBe(1);
  expect(user.name).toBe('admin');
  expect(user.role).toBe(UserRole.ADMIN);
});

test('No authentication tries to get user', async () => {
  const response = await fetch(`${TestContext.baseUrl}/users/1`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  expect(response.ok).toBe(false);
  expect(response.status).toBe(401);
});

test('User needs higher role to get user', async () => {
  const response = await fetch(`${TestContext.baseUrl}/users/1`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TestContext.loginTokens[2]}`
    }
  });

  expect(response.ok).toBe(false);
  expect(response.status).toBe(403);
});

test('User does not exist', async () => {
  const response = await fetch(`${TestContext.baseUrl}/users/99999999`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TestContext.loginTokens[1]}`
    }
  });

  expect(response.ok).toBe(false);
  expect(response.status).toBe(404);
});
