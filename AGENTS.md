# Repository Guidelines

## Project Structure & Module Organization

This is a pnpm-orchestrated polyglot monorepo for BanexReintegra Manager.

- `apps/frontend/`: Next.js 16 + React 19 operations console. Current UI is still a starter shell.
- `apps/api/private/`: NestJS 11 internal API for planned ETL, validation, cashback calculation, approval, and BanexTransfer export. Current implementation is still mostly a starter shell with a global Clerk auth guard.
- `apps/api/public/`: Hono on Bun public API with Prisma read routes protected by Clerk bearer auth.
- `apps/api/ai/`: FastAPI + scikit-learn IsolationForest anomaly service. This service already exposes health, train, upload-train, predict, and model-info endpoints.
- `constitution/`: product authority for mission, roadmap, design, and stack decisions.
- `specs/feature/`: implementation-facing feature requirements, validation rules, and build plan.
- `docs/`: research, architecture notes, technical notes, and documentation index.
- `resources/`: source business documents and datasets. Treat these as reference inputs, not generated application assets.
- `skills/`: canonical shared agent skills for Codex, Claude, and human-guided agent workflows.
- `.claude/skills/`: Claude project-skill mirrors that point back to canonical `skills/` content.

## Shared Agent Skills

Use these project skills when the task matches:

- `banex-changelog`: update `CHANGELOG.md`, summarize recent work, or prepare release notes from git history and semantic-release config.
- `banex-todo`: create, triage, or sync `TODO.md` from the constitution, specs, docs, repo state, and open questions.
- `banex-sync`: synchronize `constitution/`, `specs/`, `docs/`, `README.md`, `AGENTS.md`, and `CLAUDE.md`.
- `banex-private-api`: build or review the NestJS private API ETL, validation, cashback, approval, and export workflow.
- `banex-frontend-console`: build or review the Next.js operations console UI and workflow states.
- `banex-ai-anomaly`: work on the FastAPI anomaly detection service or its review-support integration.
- `banex-demo`: prepare the hackathon demo story, readiness checklist, and end-to-end validation path.
- `banex-data-workbook`: inspect source workbooks, `Pago QR` mappings, dataset stats, and reconciliation inputs.
- `banex-product-rules`: update business rules, finance assumptions, tier defaults, Rate Oracle policy, and open Banexcoin questions.

Skill source of truth:

- Edit canonical skills in `skills/<skill-name>/SKILL.md`.
- Keep `.claude/skills/<skill-name>/SKILL.md` mirrors concise and aligned with the canonical file.

## Build, Test, and Development Commands

From repo root:

- `pnpm install`: install pnpm workspace dependencies for `apps/frontend` and `apps/api/private`.
- `cd apps/api/public && bun install`: install public API dependencies.
- `cd apps/api/ai && uv sync`: install AI service dependencies.
- `pnpm compose`: start Redis, two Postgres databases, and the AI service.
- `pnpm compose:build`: rebuild and start compose services.
- `pnpm down`: stop compose services.
- `pnpm dev:web`: run the frontend dev server.
- `pnpm dev:private`: run the Nest private API in watch mode.
- `pnpm dev:public`: run the Hono public API with Bun hot reload.
- `pnpm dev:ai`: run the FastAPI AI service on port 8081.
- `pnpm build`: build pnpm workspace apps.
- `pnpm lint`: lint pnpm workspace apps.
- `pnpm format`: format pnpm workspace apps.

Service-specific notes:

- Public API uses Bun directly and is not part of the pnpm workspace.
- AI API uses `uv` directly and is not part of the pnpm workspace.
- Frontend and private API are pnpm workspace packages.

## Coding Style & Naming Conventions

Follow the style already present in each app.

- Frontend: TypeScript, Next.js App Router, Tailwind CSS 4, Biome.
- Private API: TypeScript, Nest class patterns, ESLint + Prettier.
- Public API: concise TypeScript with semicolon-free Hono style.
- AI API: Python 3.12, FastAPI, Pydantic, Ruff, typed functions where practical.
- Prefer descriptive file names by role: `*.controller.ts`, `*.service.ts`, `schemas.py`, `features.py`.

## Testing Guidelines

Current test coverage is limited. Do not claim production readiness from starter shells.

- Frontend: use `pnpm -F=frontend lint` and `pnpm -F=frontend build` when relevant.
- Private API: use `pnpm -F=private lint` and `pnpm -F=private build`; add tests when business logic lands.
- Public API: use Bun commands from `apps/api/public`.
- AI API: use `cd apps/api/ai && uv run ruff check .`; add FastAPI tests when endpoints change.

## Commit & Pull Request Guidelines

Git history and CI expect Conventional Commits.

- Use prefixes like `feat:`, `fix:`, `docs:`, `chore:`, `ci:`, and `build:`.
- Branch names should use conventional prefixes such as `feat/...` or `fix/...`.
- PRs should include a clear summary, impacted paths, test evidence, and linked planning material from `specs/` or `constitution/` when relevant.
- For API behavior changes, include sample request/response payloads or local verification notes.

## Security & Configuration Tips

- Keep secrets and environment-specific settings out of the repo.
- Do not commit generated reimbursement files unless explicitly required.
- Keep source challenge documents in `resources/`.
- Derived exports should go to ignored output locations unless the team decides otherwise.
- AI may explain anomalies and summaries, but deterministic cashback calculations belong in the private API.
- Clerk is the user-auth source. Frontend obtains session tokens and APIs validate `Authorization: Bearer <token>`; keep smoke and API docs endpoints public.
- BanexReintegra is login-only. Do not add self-service sign-up UI; create or invite users in Clerk Dashboard and reserve route-level role checks for future Clerk org/metadata policies.
