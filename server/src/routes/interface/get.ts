import path from 'path';
import { Settings } from '../../database/models/settings';
import { getResponseHeaders } from '../../helpers/get-response-headers';
import type { TCustomRequest, TErr, TRes } from '../../types';

/**
 * This implementation is shitty, but it makes react router work. It is what it is.
 */
const getInterface = async (req: TCustomRequest, res: TRes, err: TErr) => {
  if (Settings.disableInterface) {
    return err(
      {
        message: 'Interface is disabled'
      },
      403
    );
  }

  if (Settings.buildInfo.env === 'development') {
    return err(
      {
        message: 'Interface is not available in development mode.'
      },
      403
    );
  }

  const url = new URL(req.url);

  const subPath = url.pathname.slice(3);
  const hasExtension = !!path.extname(subPath);
  const interfaceFilePath = hasExtension ? subPath : 'index.html';
  const interfaceHtmlPath = path.join(
    process.cwd(),
    'interface',
    interfaceFilePath
  );

  const file = Bun.file(interfaceHtmlPath);

  return new Response(file, {
    headers: {
      ...getResponseHeaders(),
      'Content-Type': file.type
    }
  });
};

export { getInterface };
