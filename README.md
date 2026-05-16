# banexcoin-6plumas

BanexReintegra — standalone tool that processes monthly QR payment reports, classifies users into
cashback tiers, generates bulk USDT reimbursement files for Banexcoin's BanexTransfer, and runs
Isolation Forest anomaly detection over the transaction stream.

## Stack

| App              | Path                  | Stack                                          |
| ---------------- | --------------------- | ---------------------------------------------- |
| `frontend`       | `apps/frontend`       | Next.js 16, React 19, Tailwind 4, Biome        |
| `private-api`    | `apps/api/private`    | NestJS 11 (pnpm)                               |
| `public-api`     | `apps/api/public`     | Hono on Bun                                    |
| `ai-api`         | `apps/api/ai`         | FastAPI, scikit-learn IsolationForest, uv      |

See [CLAUDE.md](./CLAUDE.md) for architecture and dev commands.

## Quick start

```sh
pnpm install                # installs frontend + private (pnpm workspaces)
cd apps/api/public && bun install && cd -
cd apps/api/ai && uv sync && cd -
pnpm compose                # postgres x2 + ai container
```

## CI/CD

Per-service Dockerfiles built via a path-filtered matrix on every PR (`check_push.yml`), pushed
to Docker Hub on merge to `main` (`release.yml`) with semantic-release-driven tags. Deploys are
triggered via Dokploy webhooks per service.
