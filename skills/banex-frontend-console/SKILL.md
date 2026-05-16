---
name: banex-frontend-console
description: Build or review the Next.js BanexReintegra operations console for upload, validation review, cashback calculation review, approval, dashboard KPIs, and export actions. Use when working under apps/frontend or designing the internal workflow UI.
---

# Banex Frontend Console

Use this skill for the internal operations UI in `apps/frontend`.

## Product boundary

The frontend is an operations console, not a landing page or wallet.

Primary flow:

```txt
Upload -> validate -> calculate -> approve -> export
```

## Source checks

Before changing UI, inspect:

- `constitution/design.md`
- `constitution/mission.md`
- `constitution/roadmap.md`
- `specs/feature/requirements.md`
- `apps/frontend/package.json`
- existing components under `apps/frontend/src`

## UI rules

- Keep the current batch state visible.
- Make the next action obvious.
- Show validation issues before payout optimism.
- Use tables for financial review.
- Use KPI cards sparingly for totals and liability.
- Do not calculate money in UI code. Render private API outputs.
- Do not claim export readiness until approval is true.
- Keep AI anomaly information visually separate from deterministic validation.

## Starter shell caution

If `apps/frontend/src/app/page.tsx` still contains starter content, replace it with the operational workflow shell before adding decorative screens.

## Verification

Run targeted checks after changes:

```sh
pnpm -F=frontend lint
pnpm -F=frontend build
```

When a dev server is started, verify the actual UI in a browser before calling the frontend complete.
