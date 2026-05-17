---
name: banex-private-api
description: Build or review the NestJS private API for BanexReintegra ETL, Pago QR validation, cashback calculation, batch approval, and BanexTransfer export. Use when working under apps/api/private or implementing deterministic financial workflow behavior.
---

# Banex Private API

Use this skill for the core BanexReintegra business workflow in `apps/api/private`.

## Product boundary

The private API owns deterministic money workflow behavior:

- report upload and batch creation
- `Pago QR` parsing and normalization
- validation and duplicate detection
- account-month aggregation
- tier application
- cashback Bs and USDT calculation
- batch review and approval gates
- BanexTransfer export generation

AI may add review warnings, but must not calculate or mutate payout amounts.

## Source checks

Before changing behavior, inspect:

- `constitution/mission.md`
- `constitution/roadmap.md`
- `specs/feature/requirements.md`
- `specs/feature/validation.md`
- `specs/feature/plan.md`
- `docs/architecture-sketch.md`
- `apps/api/private/package.json`
- existing Nest modules, controllers, services, and DTOs

## Implementation rules

- Keep financial calculations in service/domain code, not controllers.
- Use decimal-safe handling for money. Avoid floating-point shortcuts for final payout values.
- Preserve source row context for auditability.
- Do not hardcode tier rules inside the formula. Use seed/config/database data.
- Treat batch state transitions as explicit workflow steps.
- Export only approved batches.
- Keep generated payout files traceable to the batch and calculation inputs.

## Validation defaults

Use draft P0 defaults unless Banexcoin confirms otherwise:

- include only `Pago QR`
- include only `Tipo de servicio = S-001`
- include only `Estado = Completed`
- include only `Side Cliente = Sell`
- include only `Moneda = BOB`
- flag duplicate `Transaccion Id` as critical

## Verification

Run targeted checks after changes:

```sh
pnpm -F=private build
pnpm -F=private lint
```

If tests exist or are added, run the relevant test command too.
