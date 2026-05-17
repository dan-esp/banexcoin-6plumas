# Validation and Business Rules — Oracle

## Scope

These rules define the constraints for payout FX validity and usage.

## Workflow Rules

- The P0 workflow becomes:

```txt
Upload -> validate -> calculate -> lock payout FX -> approve -> export
```

- Validation and transaction aggregation happen before payout FX lock.
- Finance must review both the calculation result and the payout FX context.
- After approval, export is a deterministic serialization step only.

## Oracle Validity Rules

The payout oracle rate is valid only if all of the following are true:

- rate is present
- rate is numeric
- rate is greater than zero
- fetch or override timestamp is present
- source or mode is present

## Guardrail Rules

- stale oracle data should block approval
- obviously out-of-range values should block approval
- rate changes after approval are forbidden

Exact freshness thresholds and rate sanity bounds should remain configuration, not hardcoded
constants in the spec.

