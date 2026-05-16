# Changelog

Human-readable working changelog for contributors. Semantic-release remains the release automation source for generated GitHub releases.

## Unreleased

### feat

- Added a dedicated `USDT/BOB` payout oracle spec with rules for rate fetch, batch FX lock, manual override, and auditability.
- Added an MVP capability spec that defines the minimum operational features needed to run the cashback workflow end to end.

### docs

- Added shared agent skills for changelog, TODO, and project sync workflows.
- Added shared agent skills for private API, frontend console, AI anomaly, and demo readiness workflows.
- Added shared agent skills for source workbook mapping and product finance rules.
- Added `TODO.md` as the shared execution board for BanexReintegra contributors.
- Added per-feature frontend specs for the operations console workflow, covering shell, upload, validation review, tier configuration, calculation results, finance approval, and export history.
- Updated feature requirements, validation rules, and implementation plan to separate historical transaction rates from locked payout oracle FX.
- Updated the shared execution board to reflect the current MVP implementation order and open product decisions.

### infra

- Added Claude project skill mirrors under `.claude/skills/` pointing to canonical shared skills.
