console.clear();
loadContext();

import { SettingKey } from '@perseusfs/shared';
import chalk from 'chalk';
import { loadDb } from './database/db';
import { Settings } from './database/models/settings';
import { getResponseHeaders } from './helpers/get-response-headers';
import { loadContext } from './helpers/load-context';
import { logRequest } from './helpers/log-request';
import { logDebug, logLogo } from './helpers/log-utils';
import { matchRoute } from './helpers/match-route';
import { patchInterface } from './helpers/patch-interface';
import { handleRoute } from './middlewares/index';
import { routes } from './routes/index';
import type { TCustomRequest } from './types';

logLogo();
loadDb();
patchInterface();

const maxRequestBodySize = Settings.get(SettingKey.MAX_REQUEST_SIZE);

// bun supports routes natively, but there's no support for middlewares.
// so I'll keep with the custom implementation
const server = Bun.serve({
  port: Settings.port,
  hostname: Settings.hostname,
  maxRequestBodySize:
    maxRequestBodySize === 0 ? Number.MAX_SAFE_INTEGER : maxRequestBodySize,
  async fetch(req) {
    const start = performance.now();
    const url = new URL(req.url);

    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: getResponseHeaders() });
    }

    if (url.pathname === '/favicon.ico') {
      return new Response(null, {
        status: 404,
        headers: getResponseHeaders()
      });
    }

    if (url.pathname === '/') {
      return new Response('Hello, World!', {
        headers: getResponseHeaders()
      });
    }

    const matchedHandlers = matchRoute(req as TCustomRequest, routes);

    let response: Response;

    if (matchedHandlers) {
      response = await handleRoute(req, ...matchedHandlers);
    } else {
      response = new Response('Not Found', {
        status: 404,
        headers: getResponseHeaders()
      });
    }

    const end = performance.now();
    const time = end - start;

    logRequest(server, req, response, time);

    return response;
  }
});

console.log(
  `${chalk.green('API:')} http://${Settings.hostname}:${Settings.port}`
);

if (!Settings.disableInterface) {
  console.log(
    `${chalk.green('Interface:')} http://${Settings.hostname}:${Settings.port}/_`
  );
}

if (Settings.debug) {
  logDebug();
}

export { server };
