import { InterfaceTag, SettingKey } from '@perseusfs/shared';
import fs from 'fs';
import path from 'path';
import { Settings } from '../database/models/settings';

const patchInterface = () => {
  if (Settings.buildInfo.env === 'development') return;

  const ogIndexHtmlPath = path.join(
    process.cwd(),
    'interface',
    'index-og.html'
  );

  const indexHtmlPath = path.join(process.cwd(), 'interface', 'index.html');
  const ogIndexHtmlContent = fs.readFileSync(ogIndexHtmlPath, 'utf-8');

  let apiHost = `${Settings.hostname}:${Settings.port}`;

  if (Settings.domain) {
    apiHost = Settings.domain;
  }

  const patchedIndexHtml = ogIndexHtmlContent
    .replace(InterfaceTag.API_HOST, apiHost)
    .replace(InterfaceTag.EXTRA_CODE, Settings.get(SettingKey.EXTRA_CODE));

  fs.writeFileSync(indexHtmlPath, patchedIndexHtml);
};

export { patchInterface };
