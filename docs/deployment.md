# Deployment & secrets

> Cómo correr **toda la stack en modo producción local** y qué variables debes definir en
> GitHub Actions + el entorno de despliegue (Dokploy).

## 1. Correr producción localmente

Antes de hacer push valida todo el stack con la misma imagen que se publicará:

```sh
cp .env.prod.example .env.prod   # editar valores
pnpm prod:up                     # build + start de todo (frontend + apis + ai + dbs)
pnpm prod:health                 # tabla de status
pnpm prod:logs                   # tail de todos los servicios
pnpm prod:down                   # stop + remove (conserva volúmenes)
pnpm prod:nuke                   # stop + remove + drop volúmenes (reset completo)
```

Default de puertos (modificables vía `.env.prod`):

| Servicio          | URL                    |
| ----------------- | ---------------------- |
| Frontend          | http://localhost:3000  |
| Public API        | http://localhost:5000  |
| Private API       | http://localhost:4000  |
| AI (FastAPI)      | http://localhost:8081  |
| Postgres privado  | localhost:5440         |
| Postgres público  | localhost:5441         |

Endpoints de smoke test:

```sh
curl -fsS http://localhost:8081/health           # AI
curl -fsS http://localhost:4000/                 # private-api
curl -fsS http://localhost:5000/                 # public-api
curl -fsS http://localhost:3000/                 # frontend
```

## 2. Variables de entorno

### 2.1 Build-time (Next.js — se hornean en el bundle)

Estas viajan como `ARG` al `Dockerfile` del frontend y quedan **incrustadas** en el JS público.
**Nunca** pongas valores secretos aquí.

| Variable                 | Para qué                                    | Ejemplo                          |
| ------------------------ | ------------------------------------------- | -------------------------------- |
| `NEXT_PUBLIC_API_URL`    | URL del public-api desde el browser         | `https://api.banexcoin.com.bo`   |
| `NEXT_PUBLIC_AI_URL`     | URL del servicio AI desde el browser        | `https://ai.banexcoin.com.bo`    |

### 2.2 Runtime — `private-api` (NestJS)

| Variable           | Obligatoria | Default                                    | Notas                                  |
| ------------------ | ----------- | ------------------------------------------ | -------------------------------------- |
| `PORT`             |             | `8080`                                     | Puerto interno                         |
| `NODE_ENV`         |             | `production`                               |                                        |
| `DATABASE_URL`     | ✅          | `postgres://…@private-database:5432/...`   | Postgres del servicio privado          |
| `AI_SERVICE_URL`   | ✅          | `http://ai:8080`                           | URL interna al servicio AI             |
| `JWT_SECRET`       | ✅          | —                                          | String aleatorio fuerte (32+ bytes)    |
| `JWT_ISSUER`       |             | `banexcoin`                                |                                        |
| `JWT_AUDIENCE`     |             | `banexcoin-internal`                       |                                        |

### 2.3 Runtime — `public-api` (Hono + Bun)

| Variable           | Obligatoria | Default                                  | Notas                            |
| ------------------ | ----------- | ---------------------------------------- | -------------------------------- |
| `PORT`             |             | `8080`                                   |                                  |
| `NODE_ENV`         |             | `production`                             |                                  |
| `DATABASE_URL`     | ✅          | `postgres://…@public-database:5432/...`  |                                  |
| `PRIVATE_API_URL`  | ✅          | `http://private-api:8080`                | URL interna al private-api       |
| `JWT_SECRET`       | ✅          | —                                        | Mismo secret que el private-api  |

### 2.4 Runtime — `ai` (FastAPI)

Prefijo `AI_`. Cargados vía `pydantic-settings` desde env.

| Variable             | Default                       | Notas                                                |
| -------------------- | ----------------------------- | ---------------------------------------------------- |
| `AI_PORT`            | `8080`                        |                                                      |
| `AI_MODEL_PATH`      | `/app/data/model.joblib`      | Persistencia del IsolationForest                     |
| `AI_CONTAMINATION`   | `auto`                        | `auto` o float `[0,0.5]`                             |
| `AI_N_ESTIMATORS`    | `200`                         | Árboles del bosque                                   |
| `AI_RANDOM_STATE`    | `42`                          |                                                      |

### 2.5 Runtime — `frontend` (Next standalone)

| Variable     | Default     | Notas                                                  |
| ------------ | ----------- | ------------------------------------------------------ |
| `PORT`       | `8080`      |                                                        |
| `HOSTNAME`   | `0.0.0.0`   | Requerido por `next start` standalone                  |
| `NODE_ENV`   | `production`|                                                        |
| `API_URL`    | —           | URL interna al public-api (server-side fetches en Next) |

## 3. Secrets en GitHub Actions

Configurar en **Settings → Secrets and variables → Actions** del repositorio.

### 3.1 Obligatorios para CI/CD

| Secret                  | Usado en                | Para qué                                                              |
| ----------------------- | ----------------------- | --------------------------------------------------------------------- |
| `DOCKERHUB_USERNAME`    | `check_push`, `release` | Login a Docker Hub para build cache y push                            |
| `DOCKERHUB_TOKEN`       | `check_push`, `release` | Personal Access Token con scope `read,write,delete`                   |
| `NEXT_PUBLIC_API_URL`   | `release`               | `--build-arg` al Dockerfile del frontend                              |
| `NEXT_PUBLIC_AI_URL`    | `release`               | `--build-arg` al Dockerfile del frontend                              |
| `DOKPLOY_URL`           | `release`               | Base URL de tu instancia Dokploy (ej. `https://dokploy.example.com`)  |

> `GITHUB_TOKEN` lo provee Actions automáticamente — **no** configurarlo manualmente.

### 3.2 Webhooks de Dokploy (no son secrets, son IDs en el YAML)

`release.yml` declara cada servicio con `webhooks_prod` como lista de IDs. Actualmente vacía
(`[]`). Cuando el servicio en Dokploy esté listo:

1. En Dokploy: **Project → Service → Webhooks** copia el ID (algo como `abc123XYZ-9`).
2. Edita `.github/workflows/release.yml` y rellena las listas correspondientes.

No son secrets — los IDs en sí no permiten deploy sin la `DOKPLOY_URL`.

### 3.3 Runtime de los contenedores en Dokploy

En **Dokploy → cada servicio → Environment** define los runtime vars de §2.2–2.5. Críticos:

- `JWT_SECRET` — generar con `openssl rand -base64 48`. **Mismo** valor en `private-api` y
  `public-api`.
- `DATABASE_URL` — apunta al servicio Postgres correspondiente dentro de la red de Dokploy.
- `AI_SERVICE_URL`, `PRIVATE_API_URL` — URLs internas (service discovery de Dokploy).

## 4. Checklist antes del primer push a `main`

- [ ] `pnpm prod:up` levanta los 4 servicios sin errores y `prod:health` muestra todos `healthy`
- [ ] Smoke test de `/health` del AI y root de las APIs responde 200
- [ ] `.env.prod` está en `.gitignore` (ya lo está vía pattern `.env*`)
- [ ] GitHub Actions secrets §3.1 cargados
- [ ] Repos `banexcoin-web-client`, `banexcoin-private-api`, `banexcoin-public-api`,
      `banexcoin-ai-api` creados en Docker Hub (o el namespace que uses)
- [ ] Servicios creados en Dokploy con sus env vars (§2) y webhook IDs anotados en
      `release.yml`

## 5. Troubleshooting rápido

| Síntoma                                          | Causa probable                                       |
| ------------------------------------------------ | ---------------------------------------------------- |
| `PRIVATE_DB_PASSWORD required` al `prod:up`      | Falta `.env.prod` o variable sin valor               |
| Frontend no llega al API en browser              | `NEXT_PUBLIC_API_URL` apunta al host equivocado (build-time, requiere rebuild) |
| `private-api` reinicia en loop                   | `JWT_SECRET` vacío o DB unreachable — `pnpm prod:logs` |
| `ai` healthcheck falla                           | El binding del puerto 8080 (interno) no está activo — revisa `uvicorn` logs |
| Postgres no levanta tras `prod:nuke`             | Volúmenes recreados; primera corrida re-inicializa esquema |
