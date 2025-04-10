import { SettingKey, UserRole } from '@perseusfs/shared';
import { expect, test } from 'bun:test';
import { TestContext } from '../../../__tests__/context';
import { Settings } from '../../../database/models/settings';

test('Authenticate user by token', async () => {
  const response = await fetch(`${TestContext.baseUrl}/users/auth`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TestContext.loginTokens[1]}`
    }
  });

  const { user, demoMode } = await response.json();

  expect(response.status).toBe(200);
  expect(user).toBeDefined();
  expect(user.id).toBe(1);
  expect(user.name).toBe('admin');
  expect(user.role).toBe(UserRole.ADMIN);
  expect(demoMode).toBeDefined();
  expect(demoMode).toBe(false);
});

test('Authenticate user by token (demo mode enabled)', async () => {
  Settings.set(SettingKey.DEMO_MODE, true);

  const response = await fetch(`${TestContext.baseUrl}/users/auth`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TestContext.loginTokens[1]}`
    }
  });

  const { demoMode } = await response.json();

  expect(demoMode).toBe(true);
});

test('No authentication tries to authenticate user', async () => {
  const response = await fetch(`${TestContext.baseUrl}/users/auth`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  expect(response.status).toBe(401);
});
