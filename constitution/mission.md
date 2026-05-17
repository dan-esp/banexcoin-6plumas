# BanexReintegra Manager Mission

## Mission

BanexReintegra Manager exists to automate and control Banexcoin's monthly cashback operations, turning manually uploaded reports into validated, auditable, approval-gated payout exports.

This project is primarily an operational product. Its first job is to reduce manual spreadsheet work and improve financial control for shared Operations and Finance workflows. It is designed for hackathon speed, but its direction is a durable internal platform, not a throwaway demo.

## Product Promise

Banexcoin already solved USDT QR payments. The next bottleneck is BanexReintegra operations.

BanexReintegra Manager moves the process from:

```txt
Manual report handling -> manual calculation -> manual payout preparation
```

to:

```txt
Upload -> validate -> calculate -> approve -> export
```

Success means the team can process a monthly cashback batch with less manual work, fewer payout risks, clearer finance review, and full traceability from source transaction to export file.

## Product Scope

The system is an internal cashback operations platform.

It does:

- Work only from manually uploaded files.
- Validate and normalize QR payment data.
- Calculate deterministic cashback results.
- Gate exports behind review and approval.
- Produce BanexTransfer-ready payout files.
- Preserve auditability across the full batch lifecycle.

It does not:

- Integrate directly with Banexcoin core systems.
- Execute payments.
- Act as a wallet, blockchain app, or QR processor.
- Let AI calculate or modify money values.

## Core Operational Principle

The product is built around a controlled monthly batch lifecycle:

```txt
UPLOADED
PARSING
VALIDATING
VALIDATED
CALCULATING
CALCULATED
UNDER_REVIEW
APPROVED
EXPORTED
FAILED
```

Each batch state exists to protect the next financial action. Export is never just a file download; it is the final step of a controlled finance operation.

## Constitution-Level Truths

The following rules are foundational and should guide roadmap, architecture, and implementation:

1. Manual uploads only. The product remains independent from Banexcoin core systems.
2. Deterministic money logic. Financial results must come from explicit rules and uploaded source data.
3. Approval before export. No payout file is generated from an unapproved batch.
4. Full traceability. Every payout must be explainable through transactions, tier rules, approvals, and export history.
5. Account-first processing. Until Banexcoin confirms otherwise, cashback is calculated at account level, not person-level grouping.
6. AI explains, never calculates. AI may summarize results and issues, but it cannot change financial outcomes.
7. Reconciliation-ready architecture. Reconciliation is not the first milestone, but ETL, rate logic, and batch design must be ready to support it.

## Primary Users

- Operations needs speed, clarity, and fewer manual transformations.
- Finance needs confidence, approval controls, and payout traceability.

Management visibility matters, but it is secondary to getting the operational and financial workflow correct.

## MVP Outcome

The MVP is successful if a team member can upload a monthly report, process valid `Pago QR` transactions, calculate cashback by account, approve the batch, and export a BanexTransfer-ready file with confidence that the result is reviewable and reproducible.
