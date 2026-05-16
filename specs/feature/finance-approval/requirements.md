# Feature Requirements — Finance Approval

## Goal

Define the UI that gates payout export behind finance review and approval.

## Main Feature

The approval screen shows liability, locked payout FX context, and approval assumptions before
Finance commits the batch.

## P0 Requirements

### 1. Liability Review

- The UI must show total cashback `Bs`, total cashback `USDT`, and eligible account count.
- The UI must keep remaining warnings or review flags visible.

### 2. Payout FX Review

- The UI must show locked payout oracle rate, source, timestamp, and mode.
- Manual override context must be visible when applicable.

### 3. Approval Action

- The UI must expose approval only when approval preconditions are satisfied.
- The UI must explain why approval is blocked when the action is unavailable.
- The UI must communicate that approval freezes the reviewed financial context.

## Non-P0 Features

- multi-step committee approval workflows
- external signatures
