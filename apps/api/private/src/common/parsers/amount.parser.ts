/**
 * Parses monetary amounts that may contain:
 * - Thousands separators: "1,575.00" → 1575
 * - Negative with space:  "- 5.00"   → -5
 * - Leading/trailing spaces
 */
export function parseAmount(raw: string | number): number {
  const s = String(raw).replace(/\s/g, '').replace(/,/g, '');
  const result = parseFloat(s);
  if (isNaN(result)) throw new Error(`parseAmount: cannot parse "${raw}"`);
  return result;
}
