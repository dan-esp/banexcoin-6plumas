# BanexReintegra Manager Tech Stack

## Overview

The current repository is a polyglot monorepo built for a hackathon-ready operations platform.

Its shape is:

- One web frontend
- Three backend services
- Two PostgreSQL databases
- One Redis instance

This is no longer a single-backend plan. The repo already separates concerns between internal business logic, public-facing access, and AI anomaly detection.

## Frontend

Frontend app:

- `apps/frontend`
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Biome

Role:

- Internal operations console
- Report upload flow
- Validation and batch review screens
- Cashback results and KPI dashboard
- Approval and export flow
- AI anomaly visibility

## Backend Services

### 1. Private API

Service:

- `apps/api/private`
- NestJS 11
- TypeScript
- Express platform
- pnpm

Role:

- Internal business API
- ETL and ingestion
- Validation rules
- Cashback calculation
- Batch lifecycle and approvals
- BanexTransfer export

This is the core financial workflow service.

### 2. Public API

Service:

- `apps/api/public`
- Hono
- TypeScript
- Bun

Role:

- Thin public-facing or gateway API
- Read-oriented or proxy-facing access
- Separation from the internal financial API

### 3. AI API

Service:

- `apps/api/ai`
- FastAPI
- Python 3.12
- uv
- scikit-learn
- pandas / numpy / openpyxl

Role:

- Isolation Forest anomaly detection
- Model training and prediction over QR transaction patterns
- Support layer for review and insights

AI remains outside the deterministic money-calculation path.

## How Many Backends?

The answer in the current repo is:

```txt
Three backend services.
```

They are:

- Private API for core business logic
- Public API for external-facing access
- AI API for anomaly detection

## Data and Infrastructure

Infrastructure currently defined in `docker-compose.yml`:

- `private-database`: PostgreSQL 17
- `public-database`: PostgreSQL 17
- `redis`: Redis 8.2
- `ai`: containerized FastAPI service

This means the current platform uses:

```txt
2 Postgres databases + 1 Redis + 1 AI service
```

## Tooling

The repo uses multiple runtimes and package managers by service:

- `pnpm` for the root workspace, frontend, and private API
- `bun` for the public API
- `uv` for the AI service

Quality tooling:

- Frontend: Biome
- Private API: ESLint + Prettier
- AI API: Ruff

## Current Technical Direction

The repo is currently aligned to this architecture:

```txt
Next.js frontend
-> Hono public API
-> NestJS private API
-> FastAPI AI service
-> PostgreSQL + Redis
```

This should be treated as the active stack unless the team explicitly decides to simplify or consolidate services later.
