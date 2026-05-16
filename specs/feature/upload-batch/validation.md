# Validation and Business Rules — Upload Batch

## Scope

These rules define frontend-side constraints for batch creation.

## Input Rules

- The upload CTA must remain disabled until a valid file is selected.
- The upload CTA must remain disabled until a period is selected.
- Unsupported file types must be rejected with clear feedback.

## UX Rules

- Upload errors must tell the user whether to retry, replace the file, or wait for backend recovery.
- The UI must not imply that upload completed successfully before the backend creates a batch.
