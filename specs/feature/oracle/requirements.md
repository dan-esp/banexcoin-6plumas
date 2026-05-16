# Feature Requirements — Oracle

## Goal

Define how BanexReintegra obtains, locks, and audits the `USDT/BOB` exchange rate used to convert
approved cashback liability from `Bs` into `USDT`.

## Main Feature

The oracle feature provides the payout FX context for cashback conversion and keeps it traceable
through review, approval, and export.

## P0 Requirements

### 1. Scope Separation

- The system must treat historical transaction-derived rates and payout oracle rates as different
  concepts.
- Historical transaction-derived rates explain the original QR payments.
- The payout oracle rate determines how approved cashback in `Bs` is converted into `USDT`.
- The payout amount in `USDT` must be derived from the locked oracle rate for the batch, not from
  the historical effective rate implied by the uploaded transactions.

### 2. Rate Definitions

The feature must preserve these rate concepts:

- `transactionImpliedRate = montoPagadoBs / montoIntercambioUsdt`
- `historicalEffectiveRate = totalConsumedBs / totalConsumedUsdt`
- `cashbackUsdt = cashbackBs / payoutOracleRate`

### 3. Oracle Fetch

- The private API must be able to retrieve the current `USDT/BOB` payout rate from a configured
  provider.
- The provider must be configurable and must not be hardcoded in the business rules.
- The fetch result must include at least:
  - rate value
  - source or provider identifier
  - fetched timestamp
  - freshness status
  - fetch status

### 4. Batch FX Lock

- A batch must use one locked payout oracle rate for its calculation and approval cycle.
- The system must lock the oracle rate before finance approval.
- Export must reuse the locked rate and must not fetch a new rate.
- Recalculation after lock must either reuse the same locked rate or require explicit unlock and
  relock behavior with audit trace.

### 5. Manual Override

- The system must support an authorized manual payout rate override.
- A manual override must require:
  - override rate
  - operator identity
  - reason
  - timestamp
- A batch using manual override must be clearly marked in review and approval outputs.

### 6. Auditability

- The system must persist the payout oracle rate used by each batch.
- The system must preserve whether the rate came from live fetch or manual override.
- The system must preserve the exact rate metadata that finance reviewed.
- Exported payout rows must remain traceable to the locked batch FX context.

### 7. Data Model Requirements

The batch aggregate should store fields equivalent to:

- `payout_oracle_rate`
- `payout_oracle_source`
- `payout_oracle_fetched_at`
- `payout_oracle_mode` with values such as `live` or `manual`
- `payout_oracle_status`
- `payout_oracle_reason`

The account-month calculation output should store or expose:

- `total_consumed_bs`
- `total_consumed_usdt`
- `historical_effective_rate`
- `cashback_percentage`
- `cashback_bs`
- `payout_oracle_rate`
- `cashback_usdt`

### 8. API Expectations

The private API should expose internal operations equivalent to:

- read current payout oracle rate
- lock payout oracle rate for a batch
- override payout oracle rate for a batch
- read locked payout FX context for review

Exact route names are implementation detail, but the workflow must support those operations.

## Non-P0 Features

- multi-source oracle consensus
- automatic retry orchestration across many providers
- intraday FX history charting
- automatic treasury execution
- public API exposure of raw oracle operations

