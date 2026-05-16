# Implementation Plan — P0

## Objective

Build the first working batch workflow without blocking on reconciliation or AI-first behavior.

## Recommended Build Order

### 1. Private API Core

Implement first:

- batch upload entrypoint
- `Pago QR` sheet detection
- row normalization
- batch persistence and lifecycle states
- validation pipeline
- account-month aggregation
- tier configuration
- cashback calculation
- payout oracle fetch and lock
- approval gate
- export generation

This is the critical path because the frontend and AI service depend on its outputs.

### 2. Frontend Workflow

Implement second:

- upload screen
- batch summary view
- validation results view
- calculation results table
- payout FX review state
- approval action
- export action

The frontend should consume deterministic private API outputs, not reimplement rules in UI code.

### 3. AI Integration Hook

Implement after the core workflow is stable:

- send normalized transactions to the AI service
- display anomaly results as review support
- keep anomaly data separate from payout approval logic

### 4. Reconciliation Hook

Prepare but do not block the P0 flow:

- preserve transaction IDs and raw references needed for `EXTRACTO DE PAGOS`
- leave room in the batch model for reconciliation findings

## Done Criteria

The first implementation is done when:

- the workbook in `resources/` can be uploaded
- `Pago QR` rows are normalized and validated
- valid rows are grouped by account and month
- cashback is calculated from configured tiers
- payout FX is locked before approval
- approval and export actions are auditable
- the batch can be approved
- a BanexTransfer-ready export can be produced only after approval

## Explicit Non-Goals for P0

- mandatory reconciliation
- AI-driven decision making
- advanced permissions model
- production-grade analytics depth
