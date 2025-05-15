import { Settings } from '../database/models/settings';
import { getResponseHeaders } from '../helpers/get-response-headers';
import type { TErrors, TGenericObject } from '../types';

const handleRoute = async (
  req: Request,
  ...middlewares: any[]
): Promise<Response> => {
  try {
    let calledRes = false;

    const res = (body: TGenericObject, status = 200) => {
      calledRes = true;

      return new Response(JSON.stringify(body), {
        status,
        headers: getResponseHeaders()
      });
    };

    const err = (errors: TErrors, status = 400) => {
      calledRes = true;

      return new Response(JSON.stringify({ errors }), {
        status: status,
        headers: getResponseHeaders()
      });
    };

    for (const middleware of middlewares) {
      const response = await middleware(req, res, err);

      if (response instanceof Response) {
        return response;
      }
    }

    if (!calledRes) {
      console.error(`Route handler did not call res() for ${req.url}`);

      return new Response('Internal Server Error', {
        status: 500,
        headers: getResponseHeaders()
      });
    }

    return new Response(JSON.stringify({ error: 'Something went wrong.' }), {
      status: 500,
      headers: getResponseHeaders()
    });
  } catch (error: any) {
    if (Settings.debug) {
      console.error(error);
    }

    return new Response(
      JSON.stringify({ error: error?.toString?.() ?? 'Something went wrong.' }),
      {
        status: 500,
        headers: getResponseHeaders()
      }
    );
  }
};

export { handleRoute };
