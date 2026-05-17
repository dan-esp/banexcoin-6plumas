/**
 * Typed domain object for a single QR Payment transaction.
 * Source: CSV/XLSX columns from "1_-_Pago_QR" file.
 *
 * Key business rules enforced during mapping:
 *   - Only rows with status === 'Completed' are kept
 *   - Rows with duplicate quoteId keep only the first occurrence (5325 → ~5238 unique)
 *   - amountBob uses parseAmount() because the CSV contains "1,575.00" with thousands separator
 *   - transactionId is kept as string (exceeds Number.MAX_SAFE_INTEGER)
 */
export interface QrPaymentRow {
  /** Unique quote identifier — deduplication key. Can be 0 (valid). */
  quoteId: number;

  /** Transaction creation timestamp with Bolivia timezone (UTC-4). */
  createdAt: Date;

  /** Transaction status. Only "Completed" rows are stored. */
  status: string;

  /** Always "Sell" — user sells USDT to pay in BOB. */
  side: string;

  /** Display name of the paying user. */
  username: string;

  /** Account number of the paying user — used for grouping/cashback. */
  accountId: number;

  /** USDT amount debited from the user. */
  amountUsdt: number;

  /** BOB amount received by the merchant. Primary field for cashback tiers. */
  amountBob: number;

  /** Payment currency — always "BOB". */
  currency: string;

  /** Exchange rate BOB/USDT at time of transaction. */
  fxRate: number;

  /** Platform commission in USDT. */
  commission: number;

  /** Last update timestamp (no timezone). */
  updatedAt: Date;

  /** Bank/blockchain transaction ID — must stay as string. */
  transactionId: string;

  /** Service type code — always "S-001". */
  serviceType: string;

  /** OMS instance — always "Banexcoin Bolivia". */
  oms: string;
}
