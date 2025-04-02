import {formatPath} from '#services/backend/utils/formatPath.ts';
import {ConfigResponse} from '#services/config/context.tsx';

function getBaseUrl(config: ConfigResponse) {
  return (path?: string, params?: Record<string, string | number>) => {
    if (!path) return config.baseUrl;

    // replace path params (e.g. /tasks/:id)
    const parsedPath = params ? formatPath(path, params) : path;

    // assume that if the baseUrl is empty we should fetch at the root of the domain
    const baseUrl = config.baseUrl === '' ? '/' : config.baseUrl;

    const hasLeadingSlash = parsedPath.startsWith('/');
    const hasTrailingSlash = baseUrl.endsWith('/');

    // sometimes we might have a base `example.com/` and a pat `/api/tasks`
    // which would result in `example.com//api/tasks` so we need to remove a `/`
    if (hasLeadingSlash && hasTrailingSlash) return `${baseUrl}${parsedPath.slice(1)}`;
    // or maybe we have `example.com` and `api/tasks` which would result in
    // `example.comapi/tasks` so in that case we need to add the `/` back in
    if (!hasLeadingSlash && !hasTrailingSlash) return `${baseUrl}/${parsedPath}`;
    // otherwise we can just concatenate the strings
    return `${baseUrl}${parsedPath}`;
  };
}

export {getBaseUrl};
