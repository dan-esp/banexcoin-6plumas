# BanexReintegra Manager Roadmap

## Roadmap Goal

Build a clear hackathon-ready path from idea to demo.

The roadmap should keep the team focused on the main product promise:

```txt
Upload report -> validate QR payments -> calculate cashback -> approve batch -> export BanexTransfer file
```

Everything else should support that flow or be treated as a differentiator.

## Phase 0: Product Foundation

Purpose:

Define enough product clarity so the team can build without debating the same assumptions every day.

Deliverables:

- Mission and core concept.
- Main user roles: Operations, Finance, Management.
- Cashback business rules draft.
- Validation rules draft.
- MVP demo flow.
- Sample tier rules for the demo.
- Open questions for Banexcoin.

Done when:

- The team agrees this is an internal cashback operations platform.
- The team agrees it is independent and works only from uploaded files.
- The team agrees the core demo flow is upload, validate, calculate, approve, and export.

## Phase 1: P0 Core Demo

Purpose:

Create the minimum working product that proves BanexReintegra can move from manual spreadsheet work to a controlled operational workflow.

### 1. Upload Monthly Report

Build:

- Upload Excel file.
- Create import batch.
- Detect `Pago QR` sheet.
- Show file metadata.
- Select or infer processing month.

Done when:

- A user can upload the Banexcoin hackathon workbook.
- The system finds the `Pago QR` sheet.
- The system blocks processing if the required sheet is missing.

### 2. Parse and Normalize Pago QR

Build:

- Read rows from `Pago QR`.
- Map expected columns.
- Normalize account ID, account name, Bs amount, USDT amount, price, status, service type, transaction ID, and date.
- Store parsed rows in memory or database.

Done when:

- The system can parse the provided workbook.
- Parsed rows have normalized field names.
- Invalid or unmapped rows are visible for review.

### 3. Validate Transactions

Build:

- Include only `Completed` transactions.
- Include only `S-001 / Pago QR` transactions.
- Exclude rows outside the selected month.
- Detect duplicate transaction IDs.
- Detect missing or non-positive Bs and USDT amounts.
- Detect missing account ID.

Done when:

- The system separates valid, warning, and blocked rows.
- Duplicate transaction IDs are visible.
- Blocked issues prevent calculation or require explicit handling.

### 4. Configure Cashback Tiers

Build:

- Seed demo tier rules.
- Allow basic tier editing if time allows.
- Define min amount, max amount, cashback percentage, and active state.

Demo tiers:

```txt
Nivel 1: Bs 100 - Bs 999.99 -> 1%
Nivel 2: Bs 1,000 - Bs 4,999.99 -> 1.5%
Nivel 3: Bs 5,000+ -> 2%
```

Done when:

- The calculation engine reads tier rules from configuration or database.
- Tier percentages are not hardcoded inside the calculation formula.

### 5. Calculate Cashback

Build:

- Group valid transactions by account and month.
- Sum total consumed Bs.
- Sum total consumed USDT.
- Calculate effective rate.
- Assign tier.
- Calculate cashback in Bs.
- Calculate cashback in USDT.

Done when:

- Each eligible account has one calculated result.
- The output shows consumption, tier, percentage, cashback Bs, and cashback USDT.
- Calculations are deterministic and repeatable.

### 6. Review Batch

Build:

- Show batch status.
- Show KPIs.
- Show validation issues.
- Show calculated user results.
- Add approve/reject action.

Done when:

- Finance can review payout liability before export.
- Export is unavailable before approval.
- Approved batches are visibly locked for export.

### 7. Export BanexTransfer File

Build:

- Generate CSV export.
- One row per account with positive cashback.
- Include receiver account ID, account name, asset, USDT amount, concept, reference, and period.

Suggested format:

```txt
receiverAccountId
receiverAccountName
asset
amountUsdt
concept
reference
periodMonth
```

Done when:

- Approved batches generate a BanexTransfer-ready CSV.
- Non-approved batches cannot export.
- Each row has a unique reference.

## Phase 2: P1 Solid Product

Purpose:

Make the demo feel like a real operations platform, not only a calculator.

Build:

- Operational dashboard.
- Batch lifecycle states.
- Audit log for upload, calculation, approval, and export.
- Basic Rate Oracle.
- Validation report export.
- Better issue review for duplicate or invalid rows.

Done when:

- A reviewer can understand batch health at a glance.
- Finance can see total cashback liability.
- Operations can explain why rows were included or excluded.
- The system records key financial actions.

## Phase 3: P2 Differentiators

Purpose:

Show why the solution is stronger than a spreadsheet macro.

Build:

- Reconciliation between `Pago QR` and `EXTRACTO DE PAGOS`.
- Anomaly detection.
- Users near tier boundary.
- Rate outlier warnings.
- Repeated same-amount transaction patterns.
- AI executive summary based only on calculated KPIs and issues.
- Payout readiness score.

Done when:

- The system highlights financial-control issues beyond basic cashback calculation.
- The AI summary explains results without changing money values.
- The pitch can show auditability, control, and scalability as differentiators.

## Suggested Demo Path

Use this sequence for the hackathon presentation:

```txt
1. Show the manual problem.
2. Upload the Banexcoin Excel report.
3. Detect Pago QR.
4. Validate transactions.
5. Highlight duplicate or blocked issues.
6. Apply cashback tiers.
7. Calculate reintegro by account.
8. Show dashboard KPIs and total liability.
9. Approve the batch.
10. Export BanexTransfer CSV.
11. Optional: show AI executive summary.
```

## Team Workstreams

### Backend / ETL

Owns:

- File upload.
- Excel parsing.
- Column normalization.
- Validation rules.
- Duplicate detection.

### Backend / Cashback

Owns:

- Tier rules.
- Aggregation.
- Cashback calculation.
- Rate Oracle.
- Export generation.

### Frontend

Owns:

- Upload screen.
- Validation results.
- Tier configuration view.
- Batch review table.
- Dashboard.
- Export action.

### Product / Pitch

Owns:

- Mission.
- Business rules.
- Demo story.
- Banexcoin questions.
- Final presentation narrative.

## MVP Scope Guardrails

Include in MVP:

- Manual file upload.
- `Pago QR` parsing.
- Validation.
- Configurable or seeded tiers.
- Cashback calculation.
- Review and approval.
- BanexTransfer CSV export.

Do not include in MVP unless core flow is done:

- Real Banexcoin integration.
- Real payment execution.
- Wallet features.
- Smart contracts.
- Complex role system.
- Background jobs.
- Fully automated reconciliation.
- AI that affects calculations.

## Current Open Decisions

1. Backend stack: keep current NestJS setup or move to C#/.NET?
2. Frontend stack: Vite React, TanStack Start, or another option?
3. Storage: database now or in-memory/file-based demo first?
4. Tier basis: Bs consumption, USDT consumption, or both?
5. Export format: confirm exact BanexTransfer columns.
6. Approval rule: should critical issues block approval completely?
7. Reconciliation: MVP or differentiator only?
8. AI summary: MVP or stretch?
