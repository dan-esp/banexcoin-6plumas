# MVP Capability Spec — Cashback Operations

## Goal

Define the minimum product capabilities required to demonstrate the BanexReintegra cashback
workflow end to end with operational confidence.

This file complements:

- `requirements.md` for the workflow contract
- `validation.md` for rule enforcement
- `oracle/requirements.md` and `oracle/validation.md` for payout FX behavior
- `plan.md` for build order

## MVP Outcome

The MVP is complete when an internal operator can upload a monthly workbook, review validation
results, calculate cashback by account, lock payout FX, obtain approval, and generate a
BanexTransfer-ready export with traceable results.

## Required Capabilities

### 1. Batch Ingestion

- Upload an Excel workbook manually.
- Create a batch record with processing status.
- Detect the `Pago QR` sheet.
- Select the month or period used for eligibility.
- Preserve source file metadata for audit and reruns.

Done when:

- the provided workbook in `resources/` creates a persistent batch record
- the batch can be re-opened later for review

### 2. Normalization Layer

- Map source workbook rows into a stable internal transaction shape.
- Preserve raw source values alongside normalized fields.
- Normalize dates, account identifiers, amounts, and transaction IDs.

Done when:

- valid source rows produce deterministic transaction DTOs or entities
- malformed source rows are captured as validation outcomes, not silent failures

### 3. Validation Engine

- Validate workbook structure and required columns.
- Validate row eligibility for cashback.
- Detect duplicates by `Transacción Id`.
- Separate rows into valid, warning, and blocked outcomes.
- Prevent blocked rows from entering cashback calculation.

Done when:

- operators can see why rows were excluded
- rerunning validation on the same input produces the same result

### 4. Account-Month Aggregation

- Group valid rows by account and selected month.
- Calculate total consumed `Bs` and total consumed `USDT`.
- Calculate historical effective rate for review and audit.

Done when:

- each account-month output is reproducible from the underlying valid rows
- grouped totals are traceable back to transaction IDs

### 5. Tiered Cashback Calculation

- Apply configurable cashback tiers.
- Persist the tier version used for the calculation.
- Calculate cashback in `Bs`.
- Convert cashback into `USDT` using the locked payout oracle rate.

Done when:

- account-month outputs show both cashback `Bs` and cashback `USDT`
- approved results remain tied to the tier version used at calculation time

### 6. Payout Oracle Handling

- Fetch the current payout oracle rate from a configured provider.
- Lock one payout rate onto the batch before approval.
- Support manual override with reason and operator trace.
- Show payout FX context during review.

Done when:

- export never depends on a fresh oracle call
- finance can review the exact payout rate that will be used

### 7. Review and Approval

- Show batch totals, validation issues, grouped account results, and locked payout FX context.
- Require explicit finance approval before export.
- Prevent silent mutation of approved batches.

Done when:

- the system stores who approved the batch and what was approved
- re-exporting an approved batch does not change the financial result

### 8. BanexTransfer Export

- Generate one payout row per eligible account with positive cashback.
- Include a unique period-aware reference per exported row.
- Keep export output deterministic for the locked batch state.

Done when:

- operators can download a BanexTransfer-ready file after approval
- each export row remains traceable to batch, account, and approval context

### 9. Audit Trail

- Record upload, validation, calculation, FX lock, manual override, approval, and export events.
- Preserve enough metadata to explain how a batch result was produced.

Done when:

- a reviewer can reconstruct the path from uploaded file to export decision

### 10. Minimal Permissions

- Restrict approval actions to designated internal roles.
- Restrict payout FX override actions to designated internal roles.

Done when:

- the demo workflow distinguishes ordinary operators from approval-capable users

## Deferred from MVP

- reconciliation with `EXTRACTO DE PAGOS`
- AI-driven financial decisions
- advanced analytics and executive reporting
- multi-provider oracle consensus
- direct Banexcoin core system integration

## Acceptance Summary

The MVP is ready to build against when the implementation can satisfy this execution path:

```txt
Upload -> normalize -> validate -> aggregate -> calculate -> lock payout FX -> approve -> export
```
