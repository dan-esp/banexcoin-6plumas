# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repo Shape

pnpm-orchestrated polyglot monorepo. Apps live under `apps/`:

- `apps/frontend` — Next.js 16 + React 19 (App Router, `output: 'standalone'`, React Compiler).
- `apps/api/private` — NestJS 11 internal API (pnpm).
- `apps/api/public` — Hono on Bun public API.
- `apps/api/ai` — FastAPI + scikit-learn IsolationForest service (Python 3.12, uv).

The root `package.json` only orchestrates pnpm workspaces (`frontend`, `private`). Hono uses Bun directly; the AI service uses `uv` — neither is a pnpm workspace.

## Project Skills

Claude project skill mirrors live under `.claude/skills/` and point to canonical shared skills in `skills/`:

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
# First-time setup
cp .env.example .env   # then adjust as needed

# Infra (mongo + ai container)
pnpm compose
pnpm compose:build
pnpm down

# Dev servers (run in separate terminals)
pnpm dev:web        # next dev              → :3000
pnpm dev:private    # nest start --watch    → :4000  (PORT in .env)
pnpm dev:public     # bun --hot             → :5000
pnpm dev:ai         # uvicorn --reload      → :8081

# Build / lint / format (parallel across pnpm workspaces)
pnpm build
pnpm lint
pnpm format

# Production stack
pnpm prod:up        # docker-compose.prod.yml with .env.prod
pnpm prod:logs
pnpm prod:down
```

AI service direct:

```sh
cd apps/api/ai
uv sync
uv run uvicorn src.main:app --reload --port 8081
uv run ruff check .
```

## Architecture

### Services and ports

| Service | Stack | Default port | Auth |
|---|---|---|---|
| frontend | Next.js 16 | 3000 | Clerk (sign-in only, no self-signup) |
| private | NestJS 11 | 4000 | Clerk bearer via `ClerkAuthGuard` (global) |
| public | Hono + Bun | 5000 | Clerk JWKS via `requireAuth` middleware |
| ai | FastAPI | 8081 | Clerk JWKS middleware (except `/health`) |

### Private API — NestJS modules

The NestJS app at `apps/api/private/src/` is organized as:

- **EtlModule** — parses uploaded CSV/XLSX into typed rows and stores them in `EtlStore`, a scoped in-memory singleton. Data lives only for the server process lifetime; restarting clears it. Currently only `EntityType.QR_PAYMENTS` (`'qr-payments'`) is supported. Parsing uses a `ParserFactory` (CSV/XLSX strategies) and a `MapperFactory` (entity-specific field mapping).
- **ProcessingModule** — Chain-of-Responsibility pipeline over the in-memory `EtlStore`. Steps in order: `ScopeFilter → BusinessFilter → RowValidation → Deduplication → Aggregation → TierClassification → CashbackCalculation → ReportBuilder`. The last result is cached in-process for `GET /last-result`.
- **OracleModule** — FX rate provider. Tries `HttpJsonOracleProvider` (calls `ORACLE_URL`), falls back to `ManualOracleProvider` (env `ORACLE_FALLBACK_RATE`). When `STORAGE_ADAPTER=mongodb`, persists rate snapshots via `BatchOracleRepository` + Mongoose.
- **BatchModule** — `POST /batches/process` combines ETL + Processing into a single endpoint; persists completed batches when MongoDB is enabled.
- **DatabaseModule** — Mongoose connection to MongoDB. Only imported when `STORAGE_ADAPTER=mongodb` (env). Default (`json`) skips Mongo entirely.

### Public API — Hono modules

`apps/api/public/src/` routes:

- `/health` — liveness, no auth.
- `/v1/batches` — read-only batch views backed by **Prisma + PostgreSQL** (separate DB from private).
- `/v1/accounts` — account read views.
- `/legacy` — legacy compatibility routes.

The public API is the only service using Prisma; run `prisma migrate deploy` inside `apps/api/public` before first use.

### AI service contract

`POST /train` — train on a JSON list of transactions.
`POST /train/upload` — train from uploaded CSV/XLSX.
`POST /predict` — score transactions; returns `score` + `is_anomaly`.
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

Engineered features: amount (Bs + USDT), fx rate, hour, day-of-week, per-user monthly aggregates (count, mean, std, total). Defined in `apps/api/ai/src/features.py`. Model persisted to `MODEL_PATH` volume.

### Frontend

`apps/frontend/src/` uses Next.js App Router. The ops console lives under `src/features/console/`. Server actions in `actions/upload.actions.ts` call the private API at `PRIVATE_API_URL` (server-only env var). The public-facing URL is `NEXT_PUBLIC_API_URL`.

## Environment Variables

Copy `.env.example` to `.env`. Key switches:

- `STORAGE_ADAPTER` — `json` (file-based, no DB needed for local dev) or `mongodb`.
- `ORACLE_URL` / `ORACLE_FALLBACK_RATE` — FX rate source for cashback calculations.
- `PRIVATE_API_URL` — server-side Next.js → private API (not exposed to browser).
- `NEXT_PUBLIC_API_URL` — browser-facing public API base URL.

## CI / Release

`.github/workflows/`:

- `check_branch.yml` — branch name convention.
- `check_pull_request.yml` — semantic PR title + conventional commit messages.
- `check_push.yml` — path-filtered build matrix (web / private / public / ai) over each Dockerfile, cache warmed against Docker Hub.
- `release.yml` — on push to `main`: semantic-release, then build + push prod/test images and optionally trigger Dokploy webhooks.

Path filters in `.github/filters.yml`. Add new services here AND in the matrices of `check_push.yml` + `release.yml`.

## Conventions

- Conventional Commits required (`feat:`, `fix:`, etc.).
- Branch naming: `feat/...`, `fix/...`, etc. — enforced by `check_branch.yml`.
- Each service's Dockerfile uses its own folder as build context; do not assume root.
- Each Dockerfile exposes `8080` (container side). Map externally in compose / Dokploy.
- All runtime containers drop to a non-root user (uid 1001).
- Adding a new entity type requires: new `EntityType` enum value, a new mapper extending `BaseMapper`, registration in `MapperFactory`, and updated column validation in `FileValidatorService`.
