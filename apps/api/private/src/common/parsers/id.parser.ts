/**
 * Keeps large numeric IDs as strings to prevent precision loss.
 * transactionId values like 6932719430 exceed Number.MAX_SAFE_INTEGER
 * and must never be converted with Number() or parseInt().
 */
export function parseLargeId(raw: unknown): string {
  return String(raw).trim();
}
