# Tech Stack — BanexReintegra

> Inventario completo de tecnologías, runtimes y herramientas. Para el problema funcional ver
> [`tech-notes.md`](./tech-notes.md), para la arquitectura lógica
> [`architecture-sketch.md`](./architecture-sketch.md).

## 1. Vista general

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│  frontend    │──────▶│  public-api  │──────▶│  private-api │
│  Next 16     │       │  Hono / Bun  │       │  Nest 11     │
└──────────────┘       └──────────────┘       └──────┬───────┘
                                                     │
                                                     ▼
                                              ┌──────────────┐
                                              │   ai-api     │
                                              │  FastAPI     │
                                              │  (uv + sk)   │
                                              └──────────────┘

Postgres x2 · Docker Hub · Dokploy · GitHub Actions
```

## 2. Servicios

### 2.1 `apps/frontend` — Next.js 16 console

| Categoría        | Tecnología                                                       |
| ---------------- | ---------------------------------------------------------------- |
| Lenguaje         | TypeScript ≥ 5                                                   |
| Runtime          | Node LTS (Alpine en Docker)                                      |
| Framework        | **Next.js 16** (App Router, `output: 'standalone'`, React Compiler) |
| UI               | React 19, Tailwind CSS 4 (`@tailwindcss/postcss`)                |
| Lint + format    | **Biome 2.2** (vcs git, organizeImports on save)                 |
| Package manager  | **pnpm 10.33** (workspace)                                       |
| Build            | `next build` → `.next/standalone` server.js                      |
| Imagen Docker    | `node:lts-alpine` multi-stage, user `nextjs:1001`, expone `8080` |
| Dev port         | 3000 (`pnpm dev:web`)                                            |

### 2.2 `apps/api/private` — NestJS internal API

| Categoría        | Tecnología                                                          |
| ---------------- | ------------------------------------------------------------------- |
| Lenguaje         | TypeScript ^5.7                                                     |
| Runtime          | Node LTS                                                            |
| Framework        | **NestJS 11** sobre Express (`@nestjs/platform-express`)            |
| ODM              | **Mongoose 8** vía `@nestjs/mongoose` (`MongooseModule.forRoot`)    |
| RxJS             | 7.8                                                                 |
| Lint + format    | **ESLint 9** (typescript-eslint, type-checked) + **Prettier 3**     |
| Package manager  | pnpm 10.33 (workspace)                                              |
| Build            | `nest build` → `dist/`                                              |
| Imagen Docker    | `node:lts-alpine` multi-stage (`deps → builder → pruned → runner`), user `node-app:1001` |
| Dev port         | 3000 (configurar `PORT` para evitar choque con frontend)            |
| Tests            | **Ninguno** — los hooks de jest/testing fueron removidos del proyecto |

### 2.3 `apps/api/public` — Hono on Bun

| Categoría        | Tecnología                                                   |
| ---------------- | ------------------------------------------------------------ |
| Lenguaje         | TypeScript                                                   |
| Runtime          | **Bun 1.x**                                                  |
| Framework        | **Hono 4.12**                                                |
| ORM              | **Prisma 6** (provider `mongodb`) — `prisma/schema.prisma`   |
| Tipos            | `@types/bun`                                                 |
| Package manager  | Bun (no pnpm; fuera del workspace pnpm)                      |
| Build            | `bunx prisma generate` → `bun build` → `dist/index.js`       |
| Imagen Docker    | `oven/bun:1-alpine`, user `bun-app:1001`                     |
| Dev port         | 3000 (`pnpm dev:public`)                                     |

### 2.4 `apps/api/ai` — FastAPI + IsolationForest

| Categoría        | Tecnología                                                            |
| ---------------- | --------------------------------------------------------------------- |
| Lenguaje         | Python ≥ 3.12 (`.python-version`)                                     |
| Runtime          | CPython 3.12-slim-bookworm                                            |
| Framework        | **FastAPI 0.118** + `uvicorn[standard]`                               |
| ML               | **scikit-learn 1.5+** (`IsolationForest`), NumPy 2.1+, Pandas 2.2+    |
| Validación       | **Pydantic 2.10+**, `pydantic-settings`                               |
| I/O              | `openpyxl` (xlsx), `python-multipart` (file upload)                   |
| Persistencia ML  | `joblib` → `${AI_MODEL_PATH}` (`/app/data/model.joblib`)              |
| Lint             | **Ruff 0.8+** (rules: `E F I UP B SIM RUF`, line-length 100)          |
| Package manager  | **uv 0.11** (locked via `uv.lock`)                                    |
| Build            | `uv sync --frozen --no-dev`                                           |
| Imagen Docker    | `ghcr.io/astral-sh/uv:0.5-python3.12-bookworm-slim` (build) → `python:3.12-slim-bookworm` (runtime), user `appuser:1001` |
| Dev port         | 8081 (`pnpm dev:ai`)                                                  |

#### Endpoints

| Método | Path             | Notas                                                                 |
| ------ | ---------------- | --------------------------------------------------------------------- |
| GET    | `/health`        | Liveness                                                              |
| GET    | `/model/info`    | Metadata del modelo actual; 404 si no entrenado                       |
| POST   | `/train`         | Body JSON con `rows: Transaction[]` + `contamination?` (auto / float) |
| POST   | `/train/upload`  | `multipart/form-data` con archivo `.csv` o `.xlsx`                    |
| POST   | `/predict`       | Body JSON con `rows: Transaction[]` → `predictions[]`                 |

#### Features ingenieriles (`src/features.py`)

`monto_bs`, `monto_usdt`, `tipo_cambio`, `hour`, `dayofweek`,
`user_tx_count`, `user_mean_bs`, `user_std_bs`, `user_total_bs`.

## 3. Infraestructura (Docker Compose)

| Servicio  | Imagen      | Puerto host | Propósito                                                |
| --------- | ----------- | ----------- | -------------------------------------------------------- |
| `mongo`   | `mongo:8`   | 27017       | Base de datos única — private-api (Mongoose) + public-api (Prisma) |
| `ai`      | build local | 8081 → 8080 | Servicio AI (volumen `.containers/ai-data:/app/data`)    |

Una sola instancia MongoDB sirve a ambos APIs. `private-api` escribe vía Mongoose;
`public-api` lee vía Prisma Client (MongoDB provider).

Override de dev (`docker-compose.override.yml`) monta el volumen en `.containers/mongo-data/`.

## 4. CI/CD

| Componente             | Tecnología                                                      |
| ---------------------- | --------------------------------------------------------------- |
| Orquestador            | **GitHub Actions** (`.github/workflows`)                        |
| Filtrado de cambios    | `dorny/paths-filter@v3` + `.github/filters.yml`                 |
| Convenciones           | `amannn/action-semantic-pull-request@v6`, `gsactions/commit-message-checker@v2`, `deepakputhraya/action-branch-name@master` |
| Build & push           | `docker/setup-buildx-action@v3` + `docker/build-push-action@v6` (linux/amd64, cache Docker Hub) |
| Releases               | **semantic-release** (`cycjimmy/semantic-release-action@v6`) + `conventionalcommits` |
| Registry               | Docker Hub (`${DOCKERHUB_USERNAME}/banexcoin-<service>`)        |
| Deploy                 | **Dokploy** (webhooks por servicio)                             |
| Dependencias auto      | **Dependabot** (npm / pip / docker / github-actions)            |

### Pipelines

| Workflow                  | Trigger          | Qué hace                                                            |
| ------------------------- | ---------------- | ------------------------------------------------------------------- |
| `check_branch.yml`        | PR a `main`      | Valida nombre de rama (conventional prefixes)                       |
| `check_pull_request.yml`  | PR a `main`      | Valida título de PR + mensajes de commit (conventional commits)     |
| `check_push.yml`          | PR a `main`      | Matriz: build de cada Dockerfile cambiado, warm cache               |
| `release.yml`             | push a `main`    | semantic-release → build & push `:stable`/`:<ver>` → Dokploy        |

## 5. Tooling & developer experience

| Herramienta          | Uso                                                               |
| -------------------- | ----------------------------------------------------------------- |
| **pnpm 10.33**       | Monorepo manager + workspaces (frontend + private)                |
| **bun 1.x**          | Runtime + package manager para `public`                           |
| **uv 0.11**          | Env + dependency manager + lockfile para `ai`                     |
| **Biome 2.2**        | Lint + format del frontend                                        |
| **ESLint 9 + Prettier 3** | Lint + format del NestJS privado                            |
| **Ruff 0.8+**        | Lint + format del servicio AI                                     |
| **TypeScript ^5**    | Tipado estático (frontend, private, public)                       |
| **Conventional Commits** | Mensajes de commit obligatorios (gating en CI)                |
| **semantic-release** | Versionado + changelog automáticos al merge a `main`              |

## 6. Convenciones operativas

- Cada Dockerfile usa **su carpeta como contexto de build** (no asumir el root como contexto).
- Cada imagen expone **`8080`** internamente; el mapeo externo se hace en compose / Dokploy.
- Todos los contenedores corren como **usuario no-root, UID 1001**.
- Lockfiles (`pnpm-lock.yaml`, `bun.lock*`, `uv.lock`) **se commitean**.
- `.gitignore` único en el root del repo (sin per-app); ver `/.gitignore`.
- Variables secretas viven en GitHub Actions secrets (`DOCKERHUB_*`, `DOKPLOY_URL`,
  `NEXT_PUBLIC_*`).

## 7. Bumps y mantenimiento

- Dependabot abre PRs diarios por servicio para `npm` / `pip` / Docker, semanales para
  `github-actions`.
- Agrupaciones: `react*`, `@radix-ui/*`, `@nestjs/*`, `dev-dependencies`.
- Adecuación regulatoria ASFI: fecha límite **31/12/2025** (ver
  [`deep-investigation.md` §3](./deep-investigation.md#3-marco-normativo-vigente-las-5-normas-que-rigen-a-banexcoin)).
