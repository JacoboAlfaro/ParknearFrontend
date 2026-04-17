export function getApiGatewayBaseUrl(): string {
  const raw = process.env.EXPO_PUBLIC_API_GATEWAY_URL?.trim() ?? '';
  return raw.replace(/\/+$/, '');
}

export function resolveApiUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const base = getApiGatewayBaseUrl();
  if (!base) {
    throw new Error(
      'EXPO_PUBLIC_API_GATEWAY_URL no está definida. Añádela en .env o usa una URL absoluta en path.'
    );
  }
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return `${base}${suffix}`;
}
