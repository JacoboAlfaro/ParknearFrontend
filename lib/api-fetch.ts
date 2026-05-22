import { logApiError } from '@/lib/api-log';
import { resolveApiUrl } from '@/lib/api-config';

export class ApiHttpError extends Error {
  readonly status: number;
  readonly bodyText: string;

  constructor(status: number, bodyText: string, message?: string) {
    super(message ?? `HTTP ${status}`);
    this.name = 'ApiHttpError';
    this.status = status;
    this.bodyText = bodyText;
  }
}

export type ApiFetchOptions = RequestInit & {
  json?: unknown;
};

let getAuthToken: (() => string | null | undefined) | null = null;

export function setApiAuthTokenGetter(getter: (() => string | null | undefined) | null) {
  getAuthToken = getter;
}

export async function apiFetch(path: string, options: ApiFetchOptions = {}): Promise<Response> {
  const { json, headers: initHeaders, body: initBody, ...rest } = options;
  const url = resolveApiUrl(path);
  const headers = new Headers(initHeaders ?? undefined);

  const token = getAuthToken?.() ?? null;
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let body: RequestInit['body'] | undefined = initBody;
  if (json !== undefined) {
    headers.set('Content-Type', 'application/json; charset=utf-8');
    body = JSON.stringify(json);
  }

  return fetch(url, {
    ...rest,
    headers,
    body,
  });
}

export async function apiJson<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const method = options.method ?? 'GET';
  const url = resolveApiUrl(path);

  try {
    const res = await apiFetch(path, options);
    const text = await res.text();
    if (!res.ok) {
      const httpErr = new ApiHttpError(res.status, text, res.statusText || undefined);
      // logApiError(`${method} ${path}`, httpErr, { url, requestBody: options.json});
      throw httpErr;
    }
    if (!text.trim()) {
      return undefined as T;
    }
    try {
      return JSON.parse(text) as T;
    } catch {
      const parseErr = new ApiHttpError(res.status, text, 'La respuesta no es JSON válido');
      //logApiError(`${method} ${path} (JSON inválido)`, parseErr, { url });
      throw parseErr;
    }
  } catch (err) {
    if (err instanceof ApiHttpError) {
      throw err;
    }
    //logApiError(`${method} ${path} (red)`, err, { url, requestBody: options.json });
    throw err;
  }
}
