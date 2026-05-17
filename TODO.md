# TODO

Shared execution board for BanexReintegra contributors and agent sessions.

## Now

- Implement the private API Pago QR parser; done when the provided workbook in `resources/` normalizes rows into cashback transaction DTOs.
- Implement private API validation rules; done when invalid rows, duplicate transaction IDs, and non-eligible transactions are separated from valid cashback rows.
- Implement batch persistence and lifecycle states; done when a batch can move through `uploaded`, `validated`, `calculated`, `fx_locked`, `approved`, and `exported`.
- Implement monthly aggregation by account and period; done when valid rows produce deterministic account-month totals for Bs and USDT.
- Implement cashback tier configuration and calculation; done when configured tier versions produce locked cashback Bs and USDT outputs per account-month.

## Next

- Implement payout oracle fetch, lock, and manual override flow in the private API.
- Implement BanexTransfer CSV export for approved batches.
- Replace the starter frontend page with the operations console shell; done when upload, validation, calculation, FX lock, approval, and export states are visible as the main workflow.
- Add review views for batch totals, blocked rows, account results, and locked payout FX context.
- Implement audit logging for upload, validation, calculation, FX lock, approval, override, and export events.
- Implement minimal approval and FX override permissions in the internal workflow.
- Add dashboard KPIs for consumption, cashback liability, users by tier, and validation issues.
- Wire AI anomaly results into the review flow without letting AI modify financial calculations.

## Blocked

- Confirm official BanexTransfer payout columns, concept format, and accepted USDT decimals.
- Confirm whether cashback tiers are based on Bs consumption, USDT consumption, or both.
- Confirm whether critical duplicate transaction IDs block the entire batch or only affected rows.
- Confirm which provider is the operational source of truth for the `USDT/BOB` payout oracle.
- Confirm the freshness window and sanity bounds that should block approval when oracle data is stale or abnormal.
- Confirm who is allowed to apply manual payout FX overrides in the demo workflow.

## Done

- 2026-05-16: Created mission and roadmap constitution drafts for the BanexReintegra Manager workflow.
- 2026-05-16: Added shared project skills for changelog, TODO, and sync workflows.
- 2026-05-16: Added shared project skills for private API, frontend console, AI anomaly, and demo readiness workflows.
- 2026-05-16: Added shared project skills for workbook/data mapping and product/finance rules.
- 2026-05-16: Synchronized `constitution/`, `docs/README.md`, and `specs/feature/` so product truth, implementation truth, and reference material are clearly separated.
- 2026-05-16: Added the payout oracle spec and aligned feature requirements, validation rules, and implementation plan around locked payout FX.

## Questions

- Should approved/exported batches be permanently locked, or can Finance create correction batches?
- Is reconciliation with `EXTRACTO DE PAGOS` required for MVP approval or only a differentiator?
- Is the AI executive summary part of the hackathon demo or stretch scope?
- Who owns the final finance approval role in the demo story?
- Does Finance review the locked payout FX in the same step as cashback approval, or as a separate pre-approval checkpoint?
