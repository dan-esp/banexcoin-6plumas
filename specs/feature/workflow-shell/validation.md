# Validation and Business Rules — Workflow Shell

## Scope

These rules define the minimum UX and state constraints for the frontend shell.

## State Rules

- The shell must always show a batch status label when a batch exists.
- The shell must not show approval or export as primary actions while the batch is blocked by validation.
- The shell must show disabled actions with explanatory text rather than hiding all unavailable actions.

## UX Rules

- The shell must present workflow state before detailed analytics.
- The shell must preserve traceability context such as period and status while the user navigates the batch.
- The shell must not use color alone to communicate blocked, warning, approved, or exported states.
