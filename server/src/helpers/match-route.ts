import type { TCustomRequest } from '../types';

const matchRoute = (req: TCustomRequest, routes: any[]) => {
  const url = new URL(req.url);
  // Filter out empty segments so that "/buckets" becomes ["buckets"]
  const urlParts = url.pathname.split('/').filter(Boolean);

  for (const route of routes) {
    // Only consider routes with the matching method.
    if (route.method !== req.method) continue;

    // Split the route path into segments.
    const routeParts = route.path.split('/').filter(Boolean);
    req.params = {};
    let isMatch = true;
    let i = 0;

    // Walk through the route segments.
    for (; i < routeParts.length; i++) {
      const routeSegment = routeParts[i];

      if (routeSegment === '*') {
        // Wildcard: capture any remaining URL segments (even if empty)
        req.params['wildcard'] = urlParts.slice(i).join('/');
        break;
      }

      // If there are not enough URL segments, it's not a match.
      if (i >= urlParts.length) {
        isMatch = false;
        break;
      }

      const urlSegment = urlParts[i];

      if (routeSegment.startsWith(':')) {
        // Capture dynamic route parameters.
        req.params[routeSegment.slice(1)] = urlSegment;
      } else if (routeSegment !== urlSegment) {
        isMatch = false;
        break;
      }
    }

    // If the route used a wildcard, we don't need an exact segment count match.
    if (isMatch && i < routeParts.length && routeParts[i] === '*') {
      return route.handlers;
    }
    // For non-wildcard routes, ensure we've matched all URL segments.
    if (isMatch && urlParts.length === routeParts.length) {
      return route.handlers;
    }
  }

  return null;
};

export { matchRoute };
