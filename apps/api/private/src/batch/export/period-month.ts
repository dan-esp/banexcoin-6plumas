const MONTHS = new Map<string, string>([
  ['january', '01'],
  ['jan', '01'],
  ['enero', '01'],
  ['february', '02'],
  ['feb', '02'],
  ['febrero', '02'],
  ['march', '03'],
  ['mar', '03'],
  ['marzo', '03'],
  ['april', '04'],
  ['apr', '04'],
  ['abril', '04'],
  ['may', '05'],
  ['mayo', '05'],
  ['june', '06'],
  ['jun', '06'],
  ['junio', '06'],
  ['july', '07'],
  ['jul', '07'],
  ['julio', '07'],
  ['august', '08'],
  ['aug', '08'],
  ['agosto', '08'],
  ['september', '09'],
  ['sep', '09'],
  ['sept', '09'],
  ['septiembre', '09'],
  ['october', '10'],
  ['oct', '10'],
  ['octubre', '10'],
  ['november', '11'],
  ['nov', '11'],
  ['noviembre', '11'],
  ['december', '12'],
  ['dec', '12'],
  ['diciembre', '12'],
]);

export function toPeriodMonth(value: string): string {
  const isoMonth = value.match(/\b(20\d{2})-(0[1-9]|1[0-2])\b/);
  if (isoMonth) {
    return isoMonth[0];
  }

  const normalized = value
    .normalize('NFD')
    .replaceAll(/\p{Diacritic}/gu, '')
    .toLowerCase();
  const year = normalized.match(/\b(20\d{2})\b/)?.[1];

  if (year) {
    for (const [monthName, month] of MONTHS.entries()) {
      if (normalized.includes(monthName)) {
        return `${year}-${month}`;
      }
    }
  }

  return normalized
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/^-|-$/g, '')
    .slice(0, 32);
}
