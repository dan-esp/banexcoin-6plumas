# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Repo Shape

pnpm-orchestrated polyglot monorepo. Apps live under `apps/`:

- `apps/frontend` — Next.js 16 + React 19 (App Router, `output: 'standalone'`, React Compiler).
- `apps/api/private` — NestJS 11 internal API (pnpm).
- `apps/api/public` — Hono on Bun public API.
- `apps/api/ai` — FastAPI + scikit-learn IsolationForest service (Python 3.12, uv).

The root `package.json` only orchestrates pnpm workspaces (`frontend`, `private`). Hono uses Bun
directly; the AI service uses `uv` — neither is a pnpm workspace.

## Project Skills

Claude project skill mirrors live under `.claude/skills/` and point to canonical shared skills in
`skills/`:

- `banex-changelog` — maintain `CHANGELOG.md` and release summaries from git + semantic-release.
- `banex-todo` — maintain `TODO.md` as the shared execution board.
- `banex-sync` — sync `constitution/`, `specs/`, `docs/`, `README.md`, `AGENTS.md`, and this file.
- `banex-private-api` — build or review the NestJS ETL, validation, cashback, approval, and export workflow.
- `banex-frontend-console` — build or review the Next.js operations console.
- `banex-ai-anomaly` — work on FastAPI anomaly detection and review-support integration.
- `banex-demo` — prepare the hackathon demo story and readiness checklist.
- `banex-data-workbook` — inspect source workbooks, Pago QR mappings, and dataset facts.
- `banex-product-rules` — maintain business rules, finance assumptions, tier defaults, and open questions.

Edit canonical skill files in `skills/<skill-name>/SKILL.md` first, then keep mirrors aligned.

## Common Commands

From repo root.

```sh
# Infra (postgres x2, ai)
pnpm compose
pnpm compose:build
pnpm down

# Dev servers (run in separate terminals)
pnpm dev:web        # next dev          → 3000
pnpm dev:private    # nest start --watch → 3000 (set PORT to avoid clash)
pnpm dev:public     # bun --hot          → 3000
pnpm dev:ai         # uvicorn --reload   → 8081

# Build / lint / format (parallel across pnpm workspaces)
pnpm build
pnpm lint
pnpm format
```

AI service direct:

```sh
cd apps/api/ai
uv sync
uv run uvicorn src.main:app --reload --port 8081
uv run ruff check .
```

## Architecture

### Services

- **private (Nest)** — internal API: file ingestion (CSV/XLSX), tier classification, cashback
  calculations, BanexTransfer export. Talks to Postgres `private-database`.
- **public (Hono)** — thin public-facing API on Bun. Auth proxy + read-only views.
- **ai (FastAPI)** — IsolationForest anomaly detection over QR transactions. Stateless HTTP API,
  model persisted to a volume (`MODEL_PATH`).
- **frontend (Next)** — ops console for uploading reports, reviewing tiers/reintegros, and
  inspecting anomalies surfaced by the AI service.

### AI service contract

`POST /train` — train on a JSON list of transactions or upload CSV/XLSX (`/train/upload`).
`POST /predict` — score one or many transactions; returns `score` + `is_anomaly`.
`GET /model/info` — current model metadata, 404 if never trained.

Transaction row schema (see `apps/api/ai/src/schemas.py`):

```json
{
  "user_id": "u-123",
  "monto_bs": 350.5,
  "monto_usdt": 50.1,
  "tipo_cambio": 6.96,
  "timestamp": "2026-05-12T14:33:00Z"
}
```

Engineered features: amount (Bs + USDT), fx rate, hour, day-of-week, per-user monthly aggregates
(count, mean, std, total). Defined in `apps/api/ai/src/features.py`.

## CI / Release

`.github/workflows/`:

- `check_branch.yml` — branch name convention.
- `check_pull_request.yml` — semantic PR title + conventional commit messages.
- `check_push.yml` — path-filtered build matrix (web / private / public / ai) over each
  Dockerfile, cache warmed against Docker Hub.
- `release.yml` — on push to `main`: semantic-release, then build + push prod/test images and
  optionally trigger Dokploy webhooks.

Path filters in `.github/filters.yml`. Add new services here AND in the matrices of
`check_push.yml` + `release.yml`.

## Conventions

- Conventional Commits required (`feat:`, `fix:`, etc.).
- Branch naming: `feat/...`, `fix/...`, etc. — enforced by `check_branch.yml`.
- Each service's Dockerfile uses its own folder as build context; do not assume root.
- Each Dockerfile exposes `8080` (container side). Map externally in compose / Dokploy.
- All runtime containers drop to a non-root user (uid 1001).
