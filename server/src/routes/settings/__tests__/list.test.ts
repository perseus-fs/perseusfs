import { expect, test } from 'bun:test';
import { TestContext } from '../../../__tests__/context';

test('List settings', async () => {
  const response = await fetch(`${TestContext.baseUrl}/settings`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TestContext.loginTokens[1]}`
    }
  });

  expect(response.ok).toBe(true);

  const { settings } = await response.json();

  expect(response.status).toBe(200);
  expect(settings).toBeDefined();
  expect(settings).toBeInstanceOf(Object);
  expect(settings.buildInfo).toBeDefined();
  expect(settings.buildInfo).toBeInstanceOf(Object);
  expect(settings.buildInfo.version).toBeString();
  expect(settings.buildInfo.date).toBeNumber();
  expect(settings.buildInfo.env).toBeOneOf(['development', 'production']);

  expect(settings.debug).toBeBoolean();
  expect(settings.disableInterface).toBeBoolean();
  expect(settings.hostname).toBeString();
  expect(settings.port).toBeNumber();
});

test('No authentication tries to list settings', async () => {
  const response = await fetch(`${TestContext.baseUrl}/settings`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  expect(response.ok).toBe(false);
  expect(response.status).toBe(401);
});

test('User needs higher role to list settings', async () => {
  const response = await fetch(`${TestContext.baseUrl}/settings`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TestContext.loginTokens[2]}`
    }
  });

  expect(response.ok).toBe(false);
  expect(response.status).toBe(403);
});
