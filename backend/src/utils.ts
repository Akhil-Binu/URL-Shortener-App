import crypto from 'crypto';

/**
 * Generates a random alphanumeric shortcode.
 */
export function generateShortCode(length = 6): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return code;
}

/**
 * Normalizes a URL by prepending 'https://' if it's missing.
 */
export function normalizeUrl(urlStr: string): string {
  let normalized = urlStr.trim();
  if (!/^https?:\/\//i.test(normalized)) {
    normalized = 'https://' + normalized;
  }
  return normalized;
}

/**
 * Validates whether a string is a valid HTTP/HTTPS URL.
 */
export function isValidUrl(urlStr: string): boolean {
  try {
    const url = new URL(urlStr);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}
