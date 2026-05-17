export function formatBs(value: number | null) {
  if (value === null) return "Pending";

  return `Bs ${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(value)}`;
}

export function formatUsdt(value: number | null) {
  if (value === null) return "Pending";

  return `${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 6,
    minimumFractionDigits: value > 100 ? 3 : 2,
  }).format(value)} USDT`;
}

export function formatCount(value: number | null) {
  if (value === null) return "Pending";

  return new Intl.NumberFormat("en-US").format(value);
}

export function formatOracleRate(value: number | null) {
  if (value === null) return "Pending";

  return `${value.toFixed(3)} BOB/USDT`;
}
