# Validation and Business Rules — Validation Review

## Scope

These rules define how validation outcomes must appear in the frontend.

## Display Rules

- Blocked rows must disable calculation.
- Warning rows must remain visible even when the batch can continue.
- Validation summary counts must be consistent with the issue list shown.

## UX Rules

- The UI must explain why the batch is blocked from calculation.
- The UI must not collapse blocked states into generic error banners.
- Severity must be communicated by label and text, not color alone.
