import { SettingKey } from '@perseusfs/shared';
import chalk from 'chalk';
import fs from 'fs';
import { parseArgs } from 'util';
import { getBuildInfo } from '../../helpers/get-build-info';
import { getLocalIPAddress } from '../../helpers/get-local-ip';
import { type TBuildInfo } from '../../types';
import { db } from '../db';

type SettingTypes = {
  [SettingKey.MAX_REQUEST_SIZE]: number;
  [SettingKey.CORS_ALLOW_ORIGIN]: string;
  [SettingKey.EXTRA_HEADERS]: Record<string, string>;
  [SettingKey.EXTRA_CODE]: string;
  [SettingKey.MAX_DISK_USAGE]: number;
  [SettingKey.JWT_SECRET]: string;
  [SettingKey.SIGNED_URL_SECRET]: string;
};

const types: { [K in keyof SettingTypes]: string } = {
  [SettingKey.MAX_REQUEST_SIZE]: 'number',
  [SettingKey.CORS_ALLOW_ORIGIN]: 'string',
  [SettingKey.EXTRA_HEADERS]: 'object',
  [SettingKey.EXTRA_CODE]: 'string',
  [SettingKey.MAX_DISK_USAGE]: 'number',
  [SettingKey.JWT_SECRET]: 'string',
  [SettingKey.SIGNED_URL_SECRET]: 'string'
};

class Settings {
  public buildInfo: TBuildInfo;
  public debug: boolean;
  public disableInterface: boolean;
  public hostname: string;
  public domain?: string;
  public port: number;
  public regenCredentials: boolean;
  public showMigrations: boolean;

  private cache: Record<string, string> = {};

  public getFromEnv() {
    return {
      debug:
        process.env.DEBUG !== undefined
          ? process.env.DEBUG === 'true'
          : undefined,
      disableInterface:
        process.env.DISABLE_INTERFACE !== undefined
          ? process.env.DISABLE_INTERFACE === 'true'
          : undefined,
      hostname: process.env.HOSTNAME,
      domain: process.env.DOMAIN,
      port: process.env.PORT ? parseInt(process.env.PORT, 10) : undefined,
      regenCredentials:
        process.env.REGEN_CREDENTIALS !== undefined
          ? process.env.REGEN_CREDENTIALS === 'true'
          : undefined,
      showMigrations:
        process.env.SHOW_MIGRATIONS !== undefined
          ? process.env.SHOW_MIGRATIONS === 'true'
          : undefined
    };
  }

  public getFromArgs() {
    const { values } = parseArgs({
      args: Bun.argv,
      options: {
        debug: { type: 'boolean', default: false },
        disableInterface: { type: 'boolean', default: false },
        domain: {
          type: 'string',
          default: undefined
        },
        hostname: {
          type: 'string',
          default:
            this.buildInfo.env === 'development'
              ? 'localhost'
              : getLocalIPAddress()
        },
        port: { type: 'string', default: '3000' },
        regenCredentials: { type: 'boolean', default: false },
        help: { type: 'boolean', short: 'h', default: false },
        version: { type: 'boolean', short: 'v', default: false },
        showMigrations: { type: 'boolean', default: false }
      },
      strict: true,
      allowPositionals: true
    });

    return values;
  }

  constructor() {
    this.buildInfo = getBuildInfo();

    const argValues = this.getFromArgs();
    const envValues = this.getFromEnv();

    this.debug = envValues.debug ?? argValues.debug;
    this.disableInterface =
      envValues.disableInterface ?? argValues.disableInterface;
    this.domain = envValues.domain ?? argValues.domain;
    this.hostname = envValues.hostname ?? argValues.hostname;
    this.port = envValues.port ?? parseInt(argValues.port, 10);
    this.regenCredentials =
      envValues.regenCredentials ?? argValues.regenCredentials;
    this.showMigrations = envValues.showMigrations ?? argValues.showMigrations;

    if (argValues.help) {
      this.printHelp();
      process.exit(0);
    }

    if (argValues.version) {
      console.log(
        `${chalk.green('PerseusFS:')} v${this.buildInfo.version} (${this.buildInfo.env})`
      );
      console.log(`${chalk.green('Bun:')} ${Bun.version}`);
      process.exit(0);
    }
  }

  public printHelp() {
    console.log(`
  ${chalk.bold('Usage:')} [options]

  ${chalk.bold('Options:')}
    ${chalk.green('--debug')}              Enable debug mode.
    ${chalk.green('--disable-interface')}  Disable the web interface.
    ${chalk.green('--domain')}             The domain that will be used for the interface to connect to the server.
    ${chalk.green('--hostname')}           The hostname to use for the server.
    ${chalk.green('--port')}               The port to use for the server.
    ${chalk.green('--regen-credentials')}  Regenerate the credentials for the server.
    ${chalk.green('--show-migrations')}    Show information about the migrations.
    ${chalk.green('--help')}               Show this message.
    ${chalk.green('--version')}            Show the version of the server.
    `);
  }

  public createTable() {
    db.exec(`
      CREATE TABLE settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);
  }

  public dropTable() {
    db.exec('DROP TABLE IF EXISTS settings');
  }

  public get<K extends keyof SettingTypes>(key: K): SettingTypes[K] {
    const type = types[key];
    let value: string;

    if (this.cache[key]) {
      value = this.cache[key];
    } else {
      const query = db.query('SELECT value FROM settings WHERE key = $key');

      const result = query.get({ key }) as { value: string };

      value = result?.value;
    }

    if (type === 'number') {
      return parseInt(value, 10) as SettingTypes[K];
    }

    if (type === 'object') {
      return JSON.parse(value) as SettingTypes[K];
    }

    return value as SettingTypes[K];
  }

  public set<K extends keyof SettingTypes>(key: K, value: SettingTypes[K]) {
    const query = db.query(
      'INSERT OR REPLACE INTO settings (key, value) VALUES ($key, $value)'
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

  public toJSON() {
    const dynamicSettings = Object.values(SettingKey).reduce<
      Record<string, string>
    >((acc, key) => {
      acc[key] = this.get(key as SettingKey) as string;

      return acc;
    }, {});

    return {
      buildInfo: this.buildInfo,
      debug: this.debug,
      disableInterface: this.disableInterface,
      domain: this.domain,
      hostname: this.hostname,
      port: this.port,
      regenCredentials: this.regenCredentials,
      jwtSecret: null, // this should not be exposed here
      signedUrlSecret: null, // this should not be exposed here
      ...dynamicSettings
    };
  }
}

const SettingsInstance = new Settings();

export { SettingsInstance as Settings };
