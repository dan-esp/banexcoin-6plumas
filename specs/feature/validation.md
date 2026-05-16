# Validation and Business Rules — P0

## Scope

These rules define which `Pago QR` rows can enter cashback calculation for the MVP.

## Structural Validation

- The uploaded file must be an Excel workbook.
- The workbook must contain the `Pago QR` sheet.
- Required columns must exist before row-level validation starts.
- The workbook may contain other sheets, but they are ignored for cashback calculation.

## Required Columns

The MVP expects these source fields from `Pago QR`:

- `Fecha de creación`
- `Estado`
- `Side Cliente`
- `Creado por`
- `Número de Cuenta`
- `Monto intercambio`
- `Monto Pagado`
- `Moneda`
- `Precio`
- `Transacción Id`
- `Tipo de servicio`

## Transaction Eligibility

A row is eligible only if all of the following are true:

- `Tipo de servicio == S-001`
- `Estado == Completed`
- `Side Cliente == Sell`
- `Moneda == BOB`
- `Número de Cuenta` is present
- `Monto Pagado` is present and greater than zero
- `Monto intercambio` is present and greater than zero
- `Transacción Id` is present
- `Fecha de creación` can be parsed
- The row belongs to the selected calculation month

## Duplicate Handling

- `Transacción Id` is treated as unique for cashback purposes.
- Duplicated transaction IDs are flagged as blocked issues.
- Blocked duplicates must not enter calculation twice.

## Grouping Rule

- Cashback is calculated by account.
- The default account identity is `Número de Cuenta`.
- `Creado por` is kept as the human-readable account name or alias.

## Calculation Preconditions

Only valid rows enter aggregation.

For each account and month:

- `totalConsumedBs = sum(Monto Pagado)`
- `totalConsumedUsdt = sum(Monto intercambio)`
- `historicalEffectiveRate = totalConsumedBs / totalConsumedUsdt`

Historical effective rate is derived from source transactions for audit and review only.

The payout conversion rate used to calculate cashback in `USDT` must come from the locked payout
oracle context for the batch.

## Payout Oracle Preconditions

Before approval, the batch must have a valid locked payout oracle context.

Minimum required fields:

- `payoutOracleRate`
- `payoutOracleSource`
- `payoutOracleFetchedAt`
- `payoutOracleMode`

Blocking conditions:

- payout oracle rate is missing
- payout oracle rate is not numeric
- payout oracle rate is less than or equal to zero
- payout oracle context is stale according to configured freshness rules
- payout oracle context has been changed after approval

If a manual override is used, the batch must also store an operator reason and remain visibly
marked for review.

## Approval and Export Rules

- A batch cannot be exported before approval.
- Only approved batches can generate payout files.
- Only accounts with positive cashback appear in the export.
- Export rows must be traceable to the batch and source transactions.
- Export rows must also be traceable to the locked payout oracle context used for conversion.

## AI and Reconciliation Rules

- AI may explain suspicious patterns, but it does not change validation or money results.
- Reconciliation with `EXTRACTO DE PAGOS` is not required for the first demo calculation path.
- The data model and workflow should remain ready to add reconciliation later.
