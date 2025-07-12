import {
  IOPermission,
  QuotaPolicy,
  RetentionPolicy,
  SettingKey,
  StaticKey,
  UserRole
} from '@perseusfs/shared';
import { randomUUIDv7 } from 'bun';
import { Database } from 'bun:sqlite';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { isTesting } from '../helpers/is-testing';
import { Bucket } from './models/bucket';
import { BucketPermission } from './models/bucket-permission';
import { File } from './models/file';
import { Migration } from './models/migration';
import { RequestLog } from './models/request-log';
import { Settings } from './models/settings';
import { Statics } from './models/statics';
import { User } from './models/user';
// @ts-expect-error any
import schema from './schema.sql' with { type: 'file' };

const TEST_IN_MEMORY = true;

export const DATA_PATH = isTesting()
  ? path.join(process.cwd(), '__test_data__')
  : path.join(process.cwd(), 'data');

export const BUCKETS_PATH = path.join(DATA_PATH, 'buckets');
export const DB_PATH =
  isTesting() && TEST_IN_MEMORY
    ? ':memory:'
    : path.join(DATA_PATH, 'data.sqlite');
export const DEFAULT_FILE_CONTENT = 'Hello, World!';

const getDatabaseSchema = async () => {
  const file = Bun.file(schema);

  return await file.text();
};

const ensureDirs = () => {
  const directories = [DATA_PATH, BUCKETS_PATH];

  directories.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

const clearData = (removeDb = false) => {
  if (removeDb && fs.existsSync(DATA_PATH)) {
    fs.rmdirSync(DATA_PATH, { recursive: true });
  }

  if (fs.existsSync(BUCKETS_PATH)) {
    fs.rmdirSync(BUCKETS_PATH, { recursive: true });
  }

  ensureDirs();
};

ensureDirs();

if (isTesting()) {
  clearData(true);
}

const db = new Database(DB_PATH, {
  create: true,
  strict: true
});

db.exec('PRAGMA journal_mode = WAL;');

const isDbInited = () => {
  const query = db.query(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='settings'"
  );

  const tables = query.all();

  return tables.length > 0;
};

const stringAsArrayBuffer = (str: string): ArrayBuffer => {
  const encoder = new TextEncoder();

  return encoder.encode(str).buffer as ArrayBuffer;
};

const populateDb = async () => {
  const schema = await getDatabaseSchema();

  db.exec(schema);

  const defaultBucket = 'my-bucket';
  const defaultUser = 'admin';
  const password =
    Settings.buildInfo.env === 'development' ? 'admin' : randomUUIDv7();

  User.create({
    name: defaultUser,
    password,
    role: UserRole.ADMIN
  });

  Bucket.create({
    name: defaultBucket,
    read: IOPermission.PUBLIC,
    write: IOPermission.PRIVATE,
    quotaPolicy: QuotaPolicy.UNLIMITED,
    retentionPolicy: RetentionPolicy.NEVER_DELETE,
    quota: null
  });

  File.writeFile(
    stringAsArrayBuffer(DEFAULT_FILE_CONTENT),
    1,
    1,
    'welcome.txt'
  );

  Settings.set(SettingKey.MAX_REQUEST_SIZE, 1024 * 1024 * 128); // 128MB
  Settings.set(SettingKey.CORS_ALLOW_ORIGIN, '*');
  Settings.set(SettingKey.EXTRA_HEADERS, {});
  Settings.set(SettingKey.EXTRA_CODE, '');
  Settings.set(SettingKey.MAX_DISK_USAGE, 0); // Unlimited
  Settings.set(SettingKey.DEMO_MODE, false);
  Settings.set(SettingKey.REQUEST_LOGS_RETENTION, 14 * 24 * 60 * 60); // 14 days

  Statics.set(StaticKey.JWT_SECRET, randomUUIDv7());
  Statics.set(StaticKey.JWT_REFRESH_SECRET, randomUUIDv7());
  Statics.set(StaticKey.SIGNED_URL_SECRET, randomUUIDv7());
  Statics.set(StaticKey.FIRST_START_VERSION, Settings.buildInfo.version);
  Statics.set(
    StaticKey.FIRST_START_DB_VERSION,
    Migration.getMostRecentMigrationVersion()
  );
  Statics.set(StaticKey.FIRST_START_DATE, Date.now());

  console.log(
    `\n${chalk.bgYellow('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')}`
  );
  console.log(
    `${chalk.whiteBright('PerseusFS is starting for the first time.')}`
  );
  console.log(
    `${chalk.whiteBright('The default admin user has been created. Please save and use the following credentials to login via the web interface.')}`
  );
  console.log(
    `${chalk.whiteBright('Username:')} ${chalk.greenBright(defaultUser)}`
  );
  console.log(
    `${chalk.whiteBright('Password:')} ${chalk.greenBright(password)}`
  );
  console.log(
    `${chalk.red("You won't be able to see these credentials again.")}`
  );
  console.log(
    `${chalk.bgYellow('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')}\n`
  );
};

const dropAllTables = () => {
  Migration.dropTable();
  User.dropTable();
  Bucket.dropTable();
  BucketPermission.dropTable();
  File.dropTable();
  RequestLog.dropTable();
  Settings.dropTable();
  Statics.dropTable();
};

const loadDb = async () => {
  const isInited = isDbInited();

  if (!isInited) {
    await populateDb();
  }

  if (Settings.regenCredentials) {
    const defaultUser = User.findById(1);
    const newPassword = randomUUIDv7();

    defaultUser?.update({
      password: newPassword
    });

    console.log(
      `\n${chalk.bgYellow('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')}`
    );
    console.log(
      `${chalk.whiteBright('The default admin user credentials have been reset.')}`
    );
    console.log(
      `${chalk.whiteBright('Username:')} ${chalk.greenBright(defaultUser?.name)}`
    );
    console.log(
      `${chalk.whiteBright('Password:')} ${chalk.greenBright(newPassword)}`
    );
    console.log(
      `${chalk.bgYellow('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')}\n`
    );
  }

  if (Settings.showMigrations) {
    Migration.printMigrations();
    process.exit(0);
  }

  await Migration.runMigrations();
};

export { clearData, db, dropAllTables, loadDb };
