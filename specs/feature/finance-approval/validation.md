# Validation and Business Rules — Finance Approval

## Scope

These rules define frontend approval constraints.

## Rules

- Approval must remain unavailable when validation or payout FX preconditions are not satisfied.
- Locked payout FX context must be visible on the approval screen.
- Manual oracle overrides must be clearly labeled.
- The frontend must not imply approval succeeded before backend confirmation.
