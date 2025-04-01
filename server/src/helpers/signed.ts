import { SettingKey } from '@perseusfs/shared';
import crypto from 'crypto';
import { Settings } from '../database/models/settings';

const generateSignedUrl = (
  bucketName: string,
  fileName: string,
  expiresInSeconds: number
): string => {
  const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const path = `/${bucketName}/${fileName}?expires=${expiresAt}`;

  const secret = Settings.get(SettingKey.SIGNED_URL_SECRET) || '';
  const signature = crypto
    .createHmac('sha256', secret)
    .update(path)
    .digest('hex');

  return `${path}&signature=${signature}`;
};

const validateSignedUrl = (
  expiresAt: number,
  signature: string,
  bucketName: string,
  fileName: string
): boolean => {
  if (Math.floor(Date.now() / 1000) > expiresAt) {
    return false;
  }

  const path = `/${bucketName}/${fileName}?expires=${expiresAt}`;
  const secret = Settings.get(SettingKey.SIGNED_URL_SECRET) || '';
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(path)
    .digest('hex');

  return signature === expectedSignature;
};

export { generateSignedUrl, validateSignedUrl };
