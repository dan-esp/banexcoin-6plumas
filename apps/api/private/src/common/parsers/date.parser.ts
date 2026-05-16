/**
 * Parses the Banexcoin date format with timezone.
 * Input:  "15/04/2025 09:01:55, UTC -04:00"
 * Output: Date("2025-04-15T09:01:55-04:00")
 * Used by: QrPaymentRow.createdAt
 */
export function parseBanexDate(raw: string): Date {
  const m = raw
    .trim()
    .match(
      /^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2}):(\d{2}), UTC ([+-]\d{2}:\d{2})$/,
    );
  if (!m) throw new Error(`parseBanexDate: invalid format "${raw}"`);
  const [, dd, mm, yyyy, hh, min, ss, tz] = m;
  return new Date(`${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}${tz}`);
}

/**
 * Parses the simple date format without timezone.
 * Input:  "15/04/2025 09:02:17"
 * Output: Date("2025-04-15T09:02:17")
 * Used by: QrPaymentRow.updatedAt
 */
export function parseSimpleDate(raw: string): Date {
  const trimmed = raw.trim();
  const [datePart, timePart] = trimmed.split(' ');
  const [dd, mm, yyyy] = datePart.split('/');
  return new Date(`${yyyy}-${mm}-${dd}T${timePart ?? '00:00:00'}`);
}
