import { expect, test } from 'bun:test';
import { generateSignedUrl, validateSignedUrl } from '../signed';

test('Sign URL', async () => {
  const url = generateSignedUrl('bucketName', 'my-file.txt', 3600);

  const urlParts = url.split('?');
  const path = urlParts[0].split('/');
  const query = new URLSearchParams(urlParts[1]);
  const bucketName = path[1];
  const fileName = path[2];

  expect(bucketName).toBe('bucketName');
  expect(fileName).toBe('my-file.txt');
  expect(query.get('expires')).toBeDefined();
  expect(query.get('signature')).toBeDefined();
  expect(Number(query.get('expires'))).toBeGreaterThan(
    Math.floor(Date.now() / 1000)
  );
});

test('Sign and validate URL', async () => {
  const url = generateSignedUrl('bucketName', 'my-file.txt', 3600);

  const urlParts = url.split('?');
  const path = urlParts[0].split('/');
  const query = new URLSearchParams(urlParts[1]);
  const bucketName = path[1];
  const fileName = path[2];
  const expiresAt = Number(query.get('expires'));
  const signature = String(query.get('signature'));

  expect(
    validateSignedUrl(expiresAt, signature, bucketName, fileName)
  ).toBeTrue();
  expect(
    validateSignedUrl(expiresAt + 1, signature, bucketName, fileName)
  ).toBeFalse();
});

// New Tests

test('Expired signed URL should fail validation', async () => {
  const url = generateSignedUrl('bucketName', 'expired-file.txt', -10);

  const urlParts = url.split('?');
  const query = new URLSearchParams(urlParts[1]);
  const expiresAt = Number(query.get('expires'));
  const signature = String(query.get('signature'));

  expect(
    validateSignedUrl(expiresAt, signature, 'bucketName', 'expired-file.txt')
  ).toBeFalse();
});

test('Tampered signature should fail validation', async () => {
  const url = generateSignedUrl('bucketName', 'secure-file.txt', 3600);

  const urlParts = url.split('?');
  const query = new URLSearchParams(urlParts[1]);
  const expiresAt = Number(query.get('expires'));
  const invalidSignature = '0000000000000000000000000000000000000000';

  expect(
    validateSignedUrl(
      expiresAt,
      invalidSignature,
      'bucketName',
      'secure-file.txt'
    )
  ).toBeFalse();
});

test('Tampered expiration should fail validation', async () => {
  const url = generateSignedUrl('bucketName', 'tampered-expiration.txt', 3600);

  const urlParts = url.split('?');
  const query = new URLSearchParams(urlParts[1]);
  const originalExpiresAt = Number(query.get('expires'));
  const signature = String(query.get('signature'));
  const tamperedExpiresAt = originalExpiresAt + 10000;

  expect(
    validateSignedUrl(
      tamperedExpiresAt,
      signature,
      'bucketName',
      'tampered-expiration.txt'
    )
  ).toBeFalse();
});

test('Tampered bucket name should fail validation', async () => {
  const url = generateSignedUrl('bucketName', 'secure-file.txt', 3600);

  const urlParts = url.split('?');
  const query = new URLSearchParams(urlParts[1]);
  const expiresAt = Number(query.get('expires'));
  const signature = String(query.get('signature'));

  expect(
    validateSignedUrl(expiresAt, signature, 'hackedBucket', 'secure-file.txt')
  ).toBeFalse();
});

test('Tampered file name should fail validation', async () => {
  const url = generateSignedUrl('bucketName', 'secure-file.txt', 3600);

  const urlParts = url.split('?');
  const query = new URLSearchParams(urlParts[1]);
  const expiresAt = Number(query.get('expires'));
  const signature = String(query.get('signature'));

  expect(
    validateSignedUrl(expiresAt, signature, 'bucketName', 'hacked-file.txt')
  ).toBeFalse();
});

test('Signed URLs with different durations should generate unique signatures', async () => {
  const url1 = generateSignedUrl('bucketName', 'file.txt', 300);
  const url2 = generateSignedUrl('bucketName', 'file.txt', 600);

  expect(url1).not.toBe(url2);
});

test('Short-lived URLs should expire quickly', async () => {
  const url = generateSignedUrl('bucketName', 'quick-expire.txt', 1);

  const urlParts = url.split('?');
  const query = new URLSearchParams(urlParts[1]);
  const expiresAt = Number(query.get('expires'));
  const signature = String(query.get('signature'));

  await new Promise((resolve) => setTimeout(resolve, 2000));

  expect(
    validateSignedUrl(expiresAt, signature, 'bucketName', 'quick-expire.txt')
  ).toBeFalse();
});
