import { type TSettings } from '@perseusfs/shared';
import { expect, test } from 'bun:test';
import { TestContext } from '../../../__tests__/context';

test('Update settings', async () => {
  const newData: Partial<TSettings> = {
    corsAllowOrigin: 'new-origin',
    maxRequestSize: 1024,
    extraHeaders: {
      'new-header': 'new-value'
    },
    extraCode: 'new-code'
  };

  const response = await fetch(`${TestContext.baseUrl}/settings`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TestContext.loginTokens[1]}`
    },
    body: JSON.stringify(newData)
  });

  expect(response.ok).toBe(true);
  expect(response.status).toBe(200);
});

test('No authentication tries to update settings', async () => {
  const response = await fetch(`${TestContext.baseUrl}/settings`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      corsAllowOrigin: '*'
    })
  });

  expect(response.ok).toBe(false);
  expect(response.status).toBe(401);
});

test('User needs higher role to update settings', async () => {
  const response = await fetch(`${TestContext.baseUrl}/settings`, {
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

test('Settings data is being validated', async () => {
  const wrongSettings = {
    corsAllowOrigin: null,
    maxRequestSize: -50,
    extraHeaders: 12345,
    extraCode: 12345,
    maxDiskUsage: -50
  };

  const response = await fetch(`${TestContext.baseUrl}/settings`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TestContext.loginTokens[1]}`
    },
    body: JSON.stringify(wrongSettings)
  });

  expect(response.ok).toBe(false);

  const { errors } = await response.json();

  expect(response.status).toBe(400);
  expect(errors).toBeDefined();
  expect(errors.extraHeaders).toBeDefined();
  expect(errors.extraCode).toBeDefined();
  expect(errors.corsAllowOrigin).toBeDefined();
  expect(errors.maxRequestSize).toBeDefined();
  expect(errors.maxDiskUsage).toBeDefined();
  expect(Object.keys(errors).length).toBe(5);
});
