---
name: banex-ai-anomaly
description: Work on the FastAPI anomaly detection service for BanexReintegra, including IsolationForest training, prediction, transaction feature engineering, upload parsing, and integration boundaries. Use when working under apps/api/ai or connecting AI anomaly results into review flows.
---

# Banex AI Anomaly

Use this skill for `apps/api/ai` and AI anomaly integration.

## Product boundary

The AI service supports review. It does not calculate cashback, approve batches, or change exports.

Allowed:

- anomaly scoring
- model training
- review prioritization
- executive explanation based on existing metrics

Not allowed:

- changing payout amounts
- selecting tiers
- overriding validation
- approving or exporting batches

## Source checks

Before changing AI behavior, inspect:

- `apps/api/ai/src/main.py`
- `apps/api/ai/src/schemas.py`
- `apps/api/ai/src/features.py`
- `apps/api/ai/src/model.py`
- `apps/api/ai/src/io.py`
- `CLAUDE.md` AI service contract
- `docs/architecture-sketch.md` AI section

## Contract

Current endpoints:

- `GET /health`
- `GET /model/info`
- `POST /train`
- `POST /train/upload`
- `POST /predict`

Current transaction schema:

```json
{
  "user_id": "u-123",
  "monto_bs": 350.5,
  "monto_usdt": 50.1,
  "tipo_cambio": 6.96,
  "timestamp": "2026-05-12T14:33:00Z"
}
```

## Implementation rules

- Keep schemas explicit with Pydantic.
- Keep feature engineering deterministic and documented.
- Return errors with useful HTTP status codes.
- Persist model state only through the configured model path.
- Avoid leaking raw source files or generated payout data.

## Verification

Run targeted checks after changes:

```sh
cd apps/api/ai
uv run ruff check .
```

When endpoint behavior changes, add or run API-level tests if available.
