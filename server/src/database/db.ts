import {
  IOPermission,
  QuotaPolicy,
  RetentionPolicy,
  SettingKey,
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
import { RequestLog } from './models/request-log';
import { Settings } from './models/settings';
import { User } from './models/user';

const TESTING_IN_MEMORY = true;

export const DATA_PATH = isTesting()
  ? path.join(process.cwd(), '__test_data__')
  : path.join(process.cwd(), 'data');

export const BUCKETS_PATH = path.join(DATA_PATH, 'buckets');
export const DB_PATH =
  isTesting() && TESTING_IN_MEMORY
    ? ':memory:'
    : path.join(DATA_PATH, 'data.sqlite');
export const DEFAULT_FILE_CONTENT = 'Hello, World!';

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

const populateDb = () => {
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
  Settings.set(SettingKey.MAX_DISK_USAGE, 1024 * 1024 * 1024 * 10); // 10GB
  Settings.set(SettingKey.JWT_SECRET, randomUUIDv7());
  Settings.set(SettingKey.SIGNED_URL_SECRET, randomUUIDv7());

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

const createTables = () => {
  User.createTable();
  Bucket.createTable();
  BucketPermission.createTable();
  File.createTable();
  RequestLog.createTable();
  Settings.createTable();
};

const dropAllTables = () => {
  User.dropTable();
  Bucket.dropTable();
  BucketPermission.dropTable();
  File.dropTable();
  RequestLog.dropTable();
  Settings.dropTable();
};

const loadDb = () => {
  const isInited = isDbInited();

  if (!isInited) {
    createTables();
    populateDb();
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
};

export { clearData, db, dropAllTables, loadDb };
