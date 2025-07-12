import { DEFAULT_USER_PERMISSIONS, IOPermission } from '@perseusfs/shared';
import path from 'path';
import { Bucket } from '../../database/models/bucket';
import { File } from '../../database/models/file';
import { getResponseHeaders } from '../../helpers/get-response-headers';
import { getUserFromToken } from '../../helpers/get-user-from-token';
import { validateSignedUrl } from '../../helpers/signed';
import type { TCustomRequest } from '../../types';

const getFile = async (req: TCustomRequest) => {
  const url = new URL(req.url);
  const { searchParams } = url;
  const urlParts = url.pathname.split('/').filter(Boolean);
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  const expires = Number(searchParams.get('expires') ?? 0);
  const signature = searchParams.get('signature') ?? '';

  if (urlParts.length < 2) {
    return new Response('Not found', {
      status: 404,
      headers: getResponseHeaders()
    });
  }

  const { bucketKey } = req.params;
  const fileKey = decodeURIComponent(urlParts.at(-1) ?? '');
  const bucket = Bucket.findByName(bucketKey);

  if (!bucket || !fileKey) {
    return new Response('Not found', {
      status: 404,
      headers: getResponseHeaders()
    });
  }

  const dbFile = File.findByBucketAndKey(bucket.id, fileKey);

  if (!dbFile) {
    return new Response('Not found', {
      status: 404,
      headers: getResponseHeaders(bucket.extraHeaders)
    });
  }

  if (dbFile.isDisposable()) {
    // file is supposed to already be deleted but cron didn't run yet, so we delete it here
    dbFile.delete();

    return new Response('Not found', {
      status: 404,
      headers: getResponseHeaders(bucket.extraHeaders)
    });
  }

  const filePath = path.resolve(
    Bucket.getPath(bucketKey),
    dbFile.path ?? '',
    fileKey
  );

  const file = Bun.file(filePath);

  if (!(await file.exists())) {
    return new Response('Not found', {
      status: 404,
      headers: getResponseHeaders(bucket.extraHeaders)
    });
  }

  if (bucket.read !== IOPermission.PUBLIC) {
    const user = getUserFromToken(token);

    if (bucket.read === IOPermission.PRIVATE) {
      if (expires && signature) {
        const isValid = validateSignedUrl(
          expires,
          signature,
          bucketKey,
          fileKey
        );

        if (!isValid) {
          return new Response('Unauthorized', {
            status: 401,
            headers: getResponseHeaders(bucket.extraHeaders)
          });
        }
      } else {
        if (!user) {
          return new Response('Unauthorized', {
            status: 401,
            headers: getResponseHeaders(bucket.extraHeaders)
          });
        }

        const { readPermission } =
          user.getBucketPermissions(bucket.id) ?? DEFAULT_USER_PERMISSIONS;

        if (!readPermission) {
          return new Response('Forbidden', {
            status: 403,
            headers: getResponseHeaders(bucket.extraHeaders)
          });
        }
      }
    } else if (bucket.read === IOPermission.CUSTOM) {
      req.user = user;

      try {
        if (bucket.customRead) {
          const fn = eval(bucket.customRead);
          const customFnResult = await fn(req, dbFile, bucket);

          if (!customFnResult) {
            return new Response('Forbidden', {
              status: 403,
              headers: getResponseHeaders(bucket.extraHeaders)
            });
          }
        }
      } catch {
        return new Response('Internal Server Error', {
          status: 500,
          headers: getResponseHeaders(bucket.extraHeaders)
        });
      }
    }
  }

  return new Response(file, {
    headers: {
      ...getResponseHeaders({
        'Content-Type': dbFile?.contentType ?? 'application/octet-stream',
        'Cache-Control': 'no-cache',
        ...bucket.extraHeaders
      })
    }
  });
};

export { getFile };
