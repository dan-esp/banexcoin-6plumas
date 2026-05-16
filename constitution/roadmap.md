# BanexReintegra Manager Roadmap

## Roadmap Goal

Build a hackathon-ready product that proves Banexcoin can move from manual cashback operations to a controlled digital workflow.

The core promise remains:

```txt
Upload -> validate -> calculate -> approve -> export
```

## Current Repo Direction

The repository already has the main technical pieces separated:

- `apps/frontend` for the operations console
- `apps/api/private` for core business logic
- `apps/api/public` for public-facing access
- `apps/api/ai` for anomaly detection

The roadmap should now focus less on choosing structure and more on completing the business workflow.

## Phase 1: Core Demo

Goal:

Deliver the end-to-end monthly cashback flow.

Must-have outcomes:

- Upload the Banexcoin report
- Detect and parse `Pago QR`
- Validate required fields and duplicates
- Filter valid cashback transactions
- Aggregate by account and month
- Apply cashback tiers
- Calculate cashback in Bs and USDT
- Review results in the UI
- Approve the batch
- Export a BanexTransfer-ready file

Done when:

- The demo can process the provided workbook from upload to export
- Finance can review liability before export
- Export is blocked until approval

## Phase 2: Solid Operations

Goal:

Make the product feel operationally safe, not only functional.

Main additions:

- Batch lifecycle visibility
- Validation summary and issue review
- Audit trail for upload, calculation, approval, and export
- Dashboard KPIs
- Rate Oracle basics

Done when:

- Operations can explain what happened in a batch
- Finance can trust the review flow
- The system shows why a batch is ready or blocked

## Phase 3: Differentiators

Goal:

Show value beyond spreadsheet automation.

Main additions:

- Reconciliation with `EXTRACTO DE PAGOS`
- Anomaly detection from the AI service
- Executive summary and insight layer
- Better review prioritization for suspicious users or transactions

Done when:

- The product helps detect risk, not just compute cashback
- The pitch can show control, auditability, and scalability

## Delivery Priority

Priority order:

1. Private API cashback workflow
2. Frontend review and approval flow
3. Export flow
4. AI anomaly support
5. Reconciliation and extra controls

## Demo Path

For the hackathon, the preferred story is:

```txt
1. Show the manual problem
2. Upload the report
3. Validate Pago QR data
4. Calculate cashback
5. Review totals and issues
6. Approve the batch
7. Export BanexTransfer file
8. Optionally show anomalies or AI insights
```
