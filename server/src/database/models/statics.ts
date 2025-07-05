import { StaticKey } from '@perseusfs/shared';
import fs from 'fs';
import { db } from '../db';

type StaticTypes = {
  [StaticKey.JWT_SECRET]: string;
  [StaticKey.JWT_REFRESH_SECRET]: string;
  [StaticKey.SIGNED_URL_SECRET]: string;
  [StaticKey.FIRST_START_VERSION]: string;
  [StaticKey.FIRST_START_DB_VERSION]: number;
  [StaticKey.FIRST_START_DATE]: number;
};

const types: { [K in keyof StaticTypes]: string } = {
  [StaticKey.JWT_SECRET]: 'string',
  [StaticKey.JWT_REFRESH_SECRET]: 'string',
  [StaticKey.SIGNED_URL_SECRET]: 'string',
  [StaticKey.FIRST_START_VERSION]: 'string',
  [StaticKey.FIRST_START_DB_VERSION]: 'number',
  [StaticKey.FIRST_START_DATE]: 'number'
};

class Statics {
  private cache: Record<string, string> = {};

  constructor() {}

  public dropTable() {
    db.exec('DROP TABLE IF EXISTS statics');
  }

  public get<K extends keyof StaticTypes>(key: K): StaticTypes[K] {
    const type = types[key];
    let value: string;

    if (this.cache[key]) {
      value = this.cache[key];
    } else {
      const query = db.query('SELECT value FROM statics WHERE key = $key');

      const result = query.get({ key }) as { value: string };

      value = result?.value;
    }

    if (type === 'number') {
      return parseInt(value, 10) as StaticTypes[K];
    }

    if (type === 'object') {
      return JSON.parse(value) as StaticTypes[K];
    }

    return value as StaticTypes[K];
  }

  public set<K extends keyof StaticTypes>(key: K, value: StaticTypes[K]) {
    const query = db.query(
      'INSERT OR REPLACE INTO statics (key, value) VALUES ($key, $value)'
    );

    let finalValue: string;

    if (types[key] === 'object') {
      finalValue = JSON.stringify(value);
    } else {
      finalValue = value.toString();
    }

    this.cache[key] = finalValue;

    return query.run({ key, value: this.cache[key] });
  }

  public getDatabaseSize() {
    return fs.statSync(db.filename).size;
  }
}

const StaticsInstance = new Statics();

export { StaticsInstance as Statics };
