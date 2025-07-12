import {
  IOPermission,
  QuotaPolicy,
  RetentionPolicy,
  SettingKey,
  type TBucket
} from '@perseusfs/shared';
import { expect, test } from 'bun:test';
import { TestContext } from '../../../__tests__/context';
import { Bucket } from '../../../database/models/bucket';
import { Settings } from '../../../database/models/settings';

const defaultBucket: Partial<TBucket> = {
  customRead: null,
  customWrite: null,
  quota: null,
  quotaPolicy: QuotaPolicy.UNLIMITED,
  read: IOPermission.PUBLIC,
  write: IOPermission.PUBLIC,
  retention: null,
  retentionPolicy: RetentionPolicy.NEVER_DELETE
};

test('Bucket custom headers on bucket are being set', async () => {
  const newBucketName = Math.random().toString(36).substring(2, 15);
  const fileName = 'headers-text.txt';

  const newBucket: Partial<TBucket> = {
    name: newBucketName,
    ...defaultBucket,
    extraHeaders: {
      'X-Custom-Header': 'CustomValue',
      'X-Another-Header': 'AnotherValue',
      'Hello-World': 'World'
    }
  };

  const [newBucketId, error] = Bucket.create(newBucket);

  expect(newBucketId).toBeDefined();
  expect(error).toBeUndefined();

  const newFile = TestContext.ensureFile(fileName, newBucketId!);

  expect(newFile).toBeDefined();

  const response = await fetch(
    `${TestContext.baseUrl}/${newBucketName}/${fileName}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TestContext.loginTokens[2]}`
      }
    }
  );

  expect(response.ok).toBe(true);
  expect(response.status).toBe(200);
  expect(response.headers.get('X-Custom-Header')).toBe('CustomValue');
  expect(response.headers.get('X-Another-Header')).toBe('AnotherValue');
  expect(response.headers.get('Hello-World')).toBe('World');
});

test('Bucket and global custom headers are being merged together', async () => {
  const newBucketName = Math.random().toString(36).substring(2, 15);
  const fileName = 'headers-text-2.txt';

  const newBucket: Partial<TBucket> = {
    name: newBucketName,
    ...defaultBucket,
    extraHeaders: {
      'Its-A-Me': 'Test'
    }
  };

  const [newBucketId, error] = Bucket.create(newBucket);

  expect(newBucketId).toBeDefined();
  expect(error).toBeUndefined();

  const newFile = TestContext.ensureFile(fileName, newBucketId!);

  expect(newFile).toBeDefined();

  Settings.set(SettingKey.EXTRA_HEADERS, {
    'I-Am-A-Global-Header': 'GlobalValue',
    'X-Another-Header': 'AnotherValue'
  });

  const response = await fetch(
    `${TestContext.baseUrl}/${newBucketName}/${fileName}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TestContext.loginTokens[2]}`
      }
    }
  );

  expect(response.ok).toBe(true);
  expect(response.status).toBe(200);
  expect(response.headers.get('Its-A-Me')).toBe('Test');
  expect(response.headers.get('I-Am-A-Global-Header')).toBe('GlobalValue');
  expect(response.headers.get('X-Another-Header')).toBe('AnotherValue');
});

test('Bucket header overrides global header', async () => {
  const newBucketName = Math.random().toString(36).substring(2, 15);
  const fileName = 'headers-text-3.txt';

  const newBucket: Partial<TBucket> = {
    name: newBucketName,
    ...defaultBucket,
    extraHeaders: {
      'Cache-Control': 'no-cache',
      Goat: 'Eminem'
    }
  };

  const [newBucketId, error] = Bucket.create(newBucket);

  expect(newBucketId).toBeDefined();
  expect(error).toBeUndefined();

  const newFile = TestContext.ensureFile(fileName, newBucketId!);

  expect(newFile).toBeDefined();

  Settings.set(SettingKey.EXTRA_HEADERS, {
    'Cache-Control': 'public, max-age=3600',
    Goat: 'Sam The Kid'
  });

  const response = await fetch(
    `${TestContext.baseUrl}/${newBucketName}/${fileName}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TestContext.loginTokens[2]}`
      }
    }
  );

  expect(response.ok).toBe(true);
  expect(response.status).toBe(200);
  expect(response.headers.get('Cache-Control')).toBe('no-cache');
  expect(response.headers.get('Goat')).toBe('Eminem');
});
