function parseBody(bodyText: string): unknown {
  if (!bodyText.trim()) return null;
  try {
    return JSON.parse(bodyText) as unknown;
  } catch {
    return bodyText;
  }
}

/** Registra errores de API en la consola */
export function logApiError(
  context: string,
  err: unknown,
  extra?: Record<string, unknown>,
): void {
  if (!__DEV__) return;

  const prefix = `[ParkNear API] ${context}`;

  if (
    err &&
    typeof err === 'object' &&
    'status' in err &&
    'bodyText' in err &&
    typeof (err as { status: unknown }).status === 'number'
  ) {
    const httpErr = err as { status: number; bodyText: string; message?: string };
    console.error(prefix, {
      ...extra,
      status: httpErr.status,
      statusText: httpErr.message,
      bodyRaw: httpErr.bodyText,
      bodyParsed: parseBody(httpErr.bodyText),
    });
    return;
  }

  console.error(prefix, extra ?? {}, err);
}

export function logApiOk(context: string, extra?: Record<string, unknown>): void {
  if (!__DEV__) return;
  console.log(`[ParkNear API] ${context}`, extra ?? {});
}
