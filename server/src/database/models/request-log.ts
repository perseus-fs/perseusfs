import {
  validateObject,
  ZedRequestLog,
  type TRequestLog
} from '@perseusfs/shared';
import { type TCreateResponse } from '../../types';
import { db } from '../db';

class RequestLog implements TRequestLog {
  public id!: number;
  public method!: string;
  public address!: string;
  public host!: string | null;
  public path!: string;
  public status!: number;
  public time!: number;
  public country!: string | null;
  public createdAt!: number;

  static createTable() {
    db.exec(`
      CREATE TABLE request_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          method TEXT NOT NULL,
          address TEXT NOT NULL,
          host TEXT,
          path TEXT NOT NULL,
          status INTEGER NOT NULL,
          time FLOAT NOT NULL,
          country TEXT,
          createdAt INTEGER NOT NULL
      );
    `);
  }

  static dropTable() {
    db.exec('DROP TABLE IF EXISTS request_logs');
  }

  static create(requestLog: Partial<RequestLog>): TCreateResponse {
    const errors = validateObject(requestLog, ZedRequestLog);

    if (errors) {
      return [false, errors];
    }
    const query = db
      .query(
        'INSERT INTO request_logs (method, address, host, path, status, time, country, createdAt) VALUES ($method, $address, $host, $path, $status, $time, $country, $createdAt)'
      )
      .as(RequestLog);

    query.run({
      method: requestLog.method ?? '',
      address: requestLog.address ?? '',
      path: requestLog.path ?? '',
      status: requestLog.status ?? 0,
      time: requestLog.time ?? 0,
      country: requestLog.country ?? null,
      host: requestLog.host ?? null,
      createdAt: Date.now()
    });

    return [true, {}];
  }

  public static findAll() {
    const logsQuery = `
      SELECT * FROM request_logs 
      ORDER BY createdAt DESC
    `;

    const logs = db.query(logsQuery).as(RequestLog).all();

    return logs;
  }

  public static getCount() {
    const countQuery = `
      SELECT COUNT(*) as count FROM request_logs
    `;

    const count = db.query(countQuery).get() as { count: number };

    return count.count;
  }

  // object with count of logs per status code
  public static getStats(): { status: number; count: number }[] {
    const statsQuery = `
      SELECT status, COUNT(*) as count FROM request_logs
      GROUP BY status
    `;

    const stats = db.query(statsQuery).all() as {
      status: number;
      count: number;
    }[];

    return stats;
  }
}

export { RequestLog };
