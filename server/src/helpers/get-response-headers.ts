import { SettingKey } from '@perseusfs/shared';
import { Settings } from '../database/models/settings';
import { CustomHeaders } from '../types';

const getResponseHeaders = () => {
  return {
    'Access-Control-Allow-Origin': Settings.get(SettingKey.CORS_ALLOW_ORIGIN),
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Methods': '*',
    [CustomHeaders.X_PoweredBy]: 'PerseusFS',
    [CustomHeaders.X_ServerVersion]: Settings.buildInfo.version,
    'Content-Type': 'application/json',
    ...Settings.get(SettingKey.EXTRA_HEADERS)
  };
};

export { getResponseHeaders };
