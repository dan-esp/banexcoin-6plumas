# Feature Requirements — P0 Cashback Workflow

## Goal

Define the minimum workflow the team must implement for the hackathon demo.

The feature sequence is:

```txt
Upload -> validate -> calculate -> lock payout FX -> approve -> export
```

## Main Feature

The system processes a manually uploaded Banexcoin workbook and turns valid `Pago QR`
transactions into an approval-gated BanexTransfer payout file.

## P0 Requirements

### 1. Upload Batch

- The user uploads an Excel file manually.
- The system creates a processing batch.
- The system detects the `Pago QR` sheet.
- The selected month determines which rows are eligible for calculation.

### 2. Parse and Normalize

- The system reads rows from `Pago QR`.
- The system maps the source columns into normalized transaction fields.
- The system preserves raw source values for traceability.

### 3. Validate Transactions

- The system checks structure, required fields, transaction eligibility, duplicates, and month filtering.
- The system separates rows into valid, warning, and blocked outcomes.
- Blocked issues stop calculation until resolved or explicitly handled.

### 4. Calculate Cashback

- The system groups valid rows by account and month.
- The system applies configured cashback tiers.
- The system calculates total consumed Bs, total consumed USDT, historical effective rate, cashback Bs, payout oracle rate, and cashback USDT.
- The system must keep historical transaction-derived rates separate from the oracle rate used for payout conversion.
- The system must lock the payout oracle rate used for a batch before finance approval.

### 5. Review and Approval

- The user can review totals, user results, and validation issues.
- Finance approval is required before export.
- Approved batches are locked to the calculation result and rule version used.
- Approved batches are also locked to the payout oracle rate, source, fetch timestamp, and any manual override metadata used.

### 6. Export

- The system generates one payout row per eligible account with positive cashback.
- The export must be BanexTransfer-ready.
- Each exported row must contain a unique reference for the account and period.

## Non-P0 Features

These may exist in the repo but do not block the first demo flow:

- AI anomaly explanation
- Reconciliation with `EXTRACTO DE PAGOS`
- Executive summary generation
- Advanced issue resolution UX

## MVP Operational Capabilities

The P0 workflow also depends on these supporting capabilities:

- persistent batch lifecycle tracking
- configurable and versioned cashback tiers
- locked payout FX context before approval
- reviewable batch totals and validation outcomes
- deterministic export behavior for approved batches
- auditability for operator and finance actions

See `mvp.md` for the execution-oriented capability checklist that sits under this feature spec.

## Current Service Ownership

- `apps/api/private`: core workflow, validation, calculation, approval, export
- `apps/frontend`: upload, review, approval, dashboard UX
- `apps/api/public`: thin external or read-facing API
- `apps/api/ai`: anomaly detection support outside the money-calculation path
