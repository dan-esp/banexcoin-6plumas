# Feature Requirements — Calculation Results

## Goal

Define the UI for reviewing grouped cashback outputs before finance approval.

## Main Feature

The calculation results screen shows batch-level liability and account-level outputs after
aggregation and cashback calculation.

## P0 Requirements

### 1. Batch Totals

- The UI must show total eligible accounts, total consumed `Bs`, total consumed `USDT`, total cashback `Bs`, and total cashback `USDT`.
- The UI must show the tier version used.

### 2. Account Results Table

- The UI must list grouped account-month results.
- The UI must show account identity, tier, financial totals, cashback outputs, and review state.

### 3. Calculation Trace

- The UI must allow inspection of transaction references, grouped totals, tier applied, and payout FX summary for a selected account.

## Non-P0 Features

- advanced charting
- ad hoc reporting builders
