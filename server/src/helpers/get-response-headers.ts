import { SettingKey } from '@perseusfs/shared';
import { Settings } from '../database/models/settings';
import { CustomHeaders } from '../types';

const getResponseHeaders = (headers: Record<string, string> = {}) => {
  const customHeaders = {
    ...Settings.get(SettingKey.EXTRA_HEADERS),
    ...headers
  };

  return {
    ...customHeaders,
    'Access-Control-Allow-Origin': Settings.get(SettingKey.CORS_ALLOW_ORIGIN),
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Methods': '*',
    'Content-Type': 'application/json',
    [CustomHeaders.X_PoweredBy]: 'PerseusFS',
    [CustomHeaders.X_ServerVersion]: Settings.buildInfo.version
  };
};

export { getResponseHeaders };
