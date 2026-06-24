const localBrowserOriginPattern = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/;

const configuredOrigins = (): readonly string[] =>
  [
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
    ...(process.env.CARE_DESK_CORS_ORIGINS ?? '').split(','),
  ]
    .map((origin) => origin?.trim())
    .filter((origin): origin is string => Boolean(origin));

const configuredOriginPatterns = (): readonly RegExp[] =>
  (process.env.CARE_DESK_CORS_ORIGIN_PATTERNS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
    .map((origin) => {
      const escaped = origin.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(`^${escaped.replaceAll('*', '.*')}$`);
    });

export const isAllowedCorsOrigin = (origin: string | undefined): boolean =>
  !origin ||
  localBrowserOriginPattern.test(origin) ||
  configuredOrigins().includes(origin) ||
  configuredOriginPatterns().some((pattern) => pattern.test(origin));

export const createCorsOriginCallback =
  (): ((
    origin: string | undefined,
    callback: (error: Error | null, allow?: boolean) => void,
  ) => void) =>
  (origin, callback) => {
    if (isAllowedCorsOrigin(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Origin is not allowed by the CORS policy.'), false);
  };
