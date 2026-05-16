---
name: banex-demo
description: Prepare, review, or tighten the BanexReintegra hackathon demo story, acceptance flow, demo data path, and readiness checklist. Use when asked for demo prep, pitch flow, presentation readiness, or end-to-end validation.
---

# Banex Demo

Use this skill to keep the hackathon demo coherent and executable.

## Demo promise

Banexcoin already solved USDT QR payments. BanexReintegra Manager solves the next bottleneck: scaling monthly cashback operations through upload, validation, calculation, review, audit, and export.

## Required story

Use this sequence unless the user asks otherwise:

```txt
1. Show the manual cashback pain.
2. Upload the Banexcoin report.
3. Detect Pago QR.
4. Validate transactions and show issues.
5. Apply cashback tiers.
6. Calculate reintegro by account.
7. Show KPIs and total liability.
8. Approve the batch.
9. Export BanexTransfer CSV.
10. Optionally show AI anomalies or summary.
```

## Readiness checks

Before calling the demo ready, confirm:

- The source workbook is available under `resources/`.
- The frontend starts and shows the operational workflow.
- The private API can process the selected demo path.
- Export is blocked before approval.
- AI is framed as review support, not a money engine.
- Known product questions are either answered or acknowledged.

## Narrative rules

- Keep the pitch focused on operational control, scale, and financial traceability.
- Do not present this as a wallet, blockchain app, payment processor, or real-time Banexcoin integration.
- Use exact status language when explaining batch progress.
- If a feature is mocked or pending, say so clearly.

## Useful sources

- `constitution/mission.md`
- `constitution/roadmap.md`
- `constitution/design.md`
- `TODO.md`
- `CHANGELOG.md`
