import { describe, expect, test } from 'vitest';

import { isAllowedCorsOrigin } from '../src/common/cors.js';

describe('CORS origin policy', () => {
  test('allows local browser origins and requests without an origin', () => {
    expect(isAllowedCorsOrigin(undefined)).toBe(true);
    expect(isAllowedCorsOrigin('http://localhost:3000')).toBe(true);
    expect(isAllowedCorsOrigin('http://127.0.0.1:4173')).toBe(true);
  });

  test('allows configured deployment origins from CARE_DESK_CORS_ORIGINS', () => {
    const originalOrigins = process.env.CARE_DESK_CORS_ORIGINS;
    process.env.CARE_DESK_CORS_ORIGINS =
      'https://care-desk-web.vercel.app, https://care-desk-preview.vercel.app';

    try {
      expect(isAllowedCorsOrigin('https://care-desk-web.vercel.app')).toBe(
        true,
      );
      expect(isAllowedCorsOrigin('https://care-desk-preview.vercel.app')).toBe(
        true,
      );
      expect(isAllowedCorsOrigin('https://example.com')).toBe(false);
    } finally {
      if (originalOrigins === undefined) {
        delete process.env.CARE_DESK_CORS_ORIGINS;
      } else {
        process.env.CARE_DESK_CORS_ORIGINS = originalOrigins;
      }
    }
  });

  test('allows the current Vercel deployment origin from VERCEL_URL', () => {
    const originalVercelUrl = process.env.VERCEL_URL;
    process.env.VERCEL_URL = 'care-desk-preview.vercel.app';

    try {
      expect(
        isAllowedCorsOrigin('https://care-desk-preview.vercel.app'),
      ).toBe(true);
      expect(isAllowedCorsOrigin('https://other-preview.vercel.app')).toBe(
        false,
      );
    } finally {
      if (originalVercelUrl === undefined) {
        delete process.env.VERCEL_URL;
      } else {
        process.env.VERCEL_URL = originalVercelUrl;
      }
    }
  });

  test('allows wildcard deployment origin patterns from CARE_DESK_CORS_ORIGIN_PATTERNS', () => {
    const originalPatterns = process.env.CARE_DESK_CORS_ORIGIN_PATTERNS;
    process.env.CARE_DESK_CORS_ORIGIN_PATTERNS =
      'https://care-desk-web*.vercel.app';

    try {
      expect(
        isAllowedCorsOrigin('https://care-desk-web-abc123.vercel.app'),
      ).toBe(true);
      expect(
        isAllowedCorsOrigin('https://care-desk-api-abc123.vercel.app'),
      ).toBe(false);
    } finally {
      if (originalPatterns === undefined) {
        delete process.env.CARE_DESK_CORS_ORIGIN_PATTERNS;
      } else {
        process.env.CARE_DESK_CORS_ORIGIN_PATTERNS = originalPatterns;
      }
    }
  });
});
