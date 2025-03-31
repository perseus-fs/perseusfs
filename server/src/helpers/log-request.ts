import type { Server } from 'bun';
import chalk from 'chalk';
import { RequestLog } from '../database/models/request-log';

const httpStatusColor = (status: number): string => {
  if (status >= 200 && status < 300) {
    return chalk.green(status.toString());
  } else if (status >= 300 && status < 400) {
    return chalk.yellow(status.toString());
  } else if (status >= 400 && status < 500) {
    return chalk.red(status.toString());
  } else {
    return chalk.redBright(status.toString());
  }
};

// use promise to prevent blocking the main thread
const logRequest = async (
  server: Server,
  request: Request,
  response: Response,
  time: number
): Promise<void> => {
  return new Promise((resolve) => {
    const url = new URL(request.url);
    const { address } = server.requestIP(request) || { address: 'unknown' };
    const realIp = request.headers.get('X-Real-IP') || address;

    // get geo location from cloudflare
    // IP geolocation adds the CF-IPCountry header to all requests to your origin server.
    const country = request.headers.get('CF-IPCountry') || null;

    console.log(
      `${chalk.blue(`[${request.method}]`)} ${chalk.whiteBright(url.pathname)} - ${httpStatusColor(response.status)} - ${chalk.cyan(realIp)} - ${chalk.gray(`${time.toFixed(2)} ms`)}`
    );

    RequestLog.create({
      method: request.method,
      address: realIp,
      host: request.headers.get('host'),
      path: url.pathname,
      status: response.status,
      time: time,
      country
    });

    resolve();
  });
};

export { logRequest };
