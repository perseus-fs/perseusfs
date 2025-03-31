import { expect, test } from 'bun:test';
import { routes } from '..';
import { TestContext } from '../../__tests__/context';
import { CustomHeaders } from '../../types';

test('Correct headers are being set in all routes', async () => {
  const allRoutes = routes.map((route) => {
    if (route.path.includes(':')) {
      return {
        path: route.path.split(':')[0] + '1', // 1 is an id that will always exist (according to the mocks)
        method: route.method
      };
    }

    return {
      path: route.path,
      method: route.method
    };
  });

  for (const route of allRoutes) {
    const response = await fetch(`${TestContext.baseUrl}${route.path}`, {
      method: route.method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TestContext.loginTokens[1]}`
      },
      body:
        route.method === 'POST' || route.method === 'PUT'
          ? JSON.stringify({})
          : undefined
    });

    expect(response.headers.get(CustomHeaders.X_PoweredBy)).toBe('PerseusFS');
    expect(response.headers.get(CustomHeaders.X_ServerVersion)).toBe('dev');
  }
});
