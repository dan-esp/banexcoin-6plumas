---
name: banex-product-rules
description: Work on BanexReintegra business rules, finance assumptions, cashback tiers, Rate Oracle behavior, approval policy, audit rules, and Banexcoin confirmation questions. Use when changing constitution, specs, finance logic, or product decisions.
---

# Banex Product Rules

Use this skill for product and finance-rule decisions.

## Authority

`constitution/` is product authority. `specs/` translates it into implementation. Code should follow confirmed rules and flag missing decisions.

## Rule groups

Track decisions in these groups:

- transaction eligibility
- consumption aggregation
- tier assignment
- cashback calculation
- Rate Oracle and effective rate
- approval and export gates
- audit trail
- reconciliation and anomaly warnings
- AI boundaries

## Current defaults

Use these only until Banexcoin confirms official values:

- include `Completed` `S-001` `Pago QR` rows
- group by account and selected month
- calculate `totalConsumedBs` from `Monto Pagado`
- calculate `totalConsumedUsdt` from `Monto intercambio`
- calculate `cashbackBs = totalConsumedBs * cashbackPercent`
- calculate `cashbackUsdt = totalConsumedUsdt * cashbackPercent`
- round USDT to 6 decimals
- round Bs to 2 decimals
- block export until approval
- keep AI outside money calculation

## Open-decision handling

When a rule is unconfirmed:

- write the selected default clearly
- add the question to `TODO.md`
- avoid building irreversible assumptions into code
- keep demo data configurable

## Verification

When updating rules, check:

- `constitution/mission.md`
- `constitution/roadmap.md`
- `specs/feature/requirements.md`
- `specs/feature/validation.md`
- `TODO.md`

Then sync affected docs with `banex-sync`.
