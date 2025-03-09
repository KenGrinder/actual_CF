import * as connection from '../connection';

export const fetch = async (
  input: RequestInfo | URL,
  options?: RequestInit
): Promise<Response> => {
  // Ensure manual redirect mode to catch login redirects
  const opts: RequestInit = { ...(options || {}), redirect: 'manual' };
  const response = await globalThis.fetch(input, opts);

  // Original request URL and final response URL
  const originalUrl = new URL(input instanceof Request ? input.url : String(input));
  const responseUrl = new URL(response.url);

  // If redirect occurred to a different origin or an opaque redirect was returned, trigger re-auth flow
  const differentOrigin = responseUrl.host !== originalUrl.host;
  if ((response.redirected && differentOrigin) || response.type === 'opaqueredirect') {
    connection.send('api-fetch-redirected');  // notify the app to reload/authenticate
    throw new Error(`API request redirected to auth login (${responseUrl.host})`);
  }

  return response;
};
