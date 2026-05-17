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

| Servicio     | URL                    |
| ------------ | ---------------------- |
| Frontend     | http://localhost:3000  |
| Public API   | http://localhost:5000  |
| Private API  | http://localhost:4000  |
| AI (FastAPI) | http://localhost:8081  |
| MongoDB      | localhost:27017        |

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

| Variable                                 | Para qué                                      | Ejemplo                          |
| ---------------------------------------- | --------------------------------------------- | -------------------------------- |
| `NEXT_PUBLIC_API_URL`                    | URL del public-api desde el browser           | `https://api.banexcoin.com.bo`   |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`      | Publishable key pública de Clerk              | `pk_live_...`                    |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL`          | Ruta de inicio de sesión                      | `/sign-in`                       |

### 2.2 Runtime — `private-api` (NestJS)

| Variable                    | Obligatoria | Default                           | Notas                                      |
| --------------------------- | ----------- | --------------------------------- | ------------------------------------------ |
| `PORT`                      |             | `8080`                            | Puerto interno                             |
| `NODE_ENV`                  |             | `production`                      |                                            |
| `MONGODB_URI`               | ✅          | `mongodb://mongo:27017/banexcoin` | URI de MongoDB (con auth en prod)          |
| `AI_SERVICE_URL`            | ✅          | `http://ai:8080`                  | URL interna al servicio AI                 |
| `CLERK_SECRET_KEY`          | ✅          | —                                 | Secret runtime de Clerk                    |
| `CLERK_AUTHORIZED_PARTIES`  |             | —                                 | Orígenes permitidos, separados por coma; dejar vacío para pruebas locales |

### 2.3 Runtime — `public-api` (Hono + Bun + Prisma)

| Variable                    | Obligatoria | Default                           | Notas                                   |
| --------------------------- | ----------- | --------------------------------- | --------------------------------------- |
| `PORT`                      |             | `8080`                            |                                         |
| `NODE_ENV`                  |             | `production`                      |                                         |
| `MONGODB_URI`               | ✅          | `mongodb://mongo:27017/banexcoin` | Misma instancia que private-api         |
| `PRIVATE_API_URL`           | ✅          | `http://private-api:8080`         | URL interna al private-api              |
| `CLERK_SECRET_KEY`          | ✅          | —                                 | Secret runtime de Clerk                 |
| `CLERK_AUTHORIZED_PARTIES`  |             | —                                 | Orígenes permitidos, separados por coma; dejar vacío para pruebas locales |

### 2.4 Runtime — `ai` (FastAPI)

Prefijo `AI_`. Cargados vía `pydantic-settings` desde env.

| Variable             | Default                       | Notas                                                |
| -------------------- | ----------------------------- | ---------------------------------------------------- |
| `AI_PORT`            | `8080`                        |                                                      |
| `AI_MODEL_PATH`      | `/app/data/model.joblib`      | Persistencia del IsolationForest                     |
| `AI_CONTAMINATION`   | `auto`                        | `auto` o float `[0,0.5]`                             |
| `AI_N_ESTIMATORS`    | `200`                         | Árboles del bosque                                   |
| `AI_RANDOM_STATE`    | `42`                          |                                                      |
| `CLERK_JWKS_URL`     | —                             | JWKS de Clerk para validar bearer tokens             |
| `CLERK_AUTHORIZED_PARTIES` | —                        | Orígenes permitidos, separados por coma; dejar vacío para pruebas locales |

### 2.5 Runtime — `frontend` (Next standalone)

| Variable                            | Default     | Notas                                                  |
| ----------------------------------- | ----------- | ------------------------------------------------------ |
| `PORT`                              | `8080`      |                                                        |
| `HOSTNAME`                          | `0.0.0.0`   | Requerido por `next start` standalone                  |
| `NODE_ENV`                          | `production`|                                                        |
| `API_URL`                           | —           | URL interna al public-api (server-side fetches en Next) |
| `CLERK_SECRET_KEY`                  | —           | Secret runtime para middleware de Clerk                |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | —           | Publishable key pública de Clerk                       |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL`     | `/sign-in`  | Ruta de inicio de sesión                               |

## 3. Secrets en GitHub Actions

Configurar en **Settings → Secrets and variables → Actions** del repositorio.

### 3.1 Obligatorios para CI/CD

| Secret                  | Usado en                | Para qué                                                              |
| ----------------------- | ----------------------- | --------------------------------------------------------------------- |
| `DOCKERHUB_USERNAME`    | `check_push`, `release` | Login a Docker Hub para build cache y push                            |
| `DOCKERHUB_TOKEN`       | `check_push`, `release` | Personal Access Token con scope `read,write,delete`                   |
| `NEXT_PUBLIC_API_URL`   | `release`               | `--build-arg` al Dockerfile del frontend                              |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `release`   | `--build-arg` al Dockerfile del frontend                              |
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

- `CLERK_SECRET_KEY` — secret runtime de Clerk. Definir en frontend, private-api y public-api.
- `CLERK_JWKS_URL` — endpoint JWKS de Clerk. Definir en el servicio AI.
- `CLERK_AUTHORIZED_PARTIES` — orígenes permitidos para tokens Clerk, por ejemplo
  `https://app.banexcoin.com.bo`.
- BanexReintegra es login-only: crea o invita usuarios desde Clerk Dashboard y desactiva
  registros públicos en Clerk. La app no expone flujo propio de registro.
- `MONGODB_URI` — `mongodb://user:pass@mongo:27017/banexcoin?authSource=admin`. Mismo URI en
  ambas APIs (private escribe vía Mongoose, public lee vía Prisma).
- `AI_SERVICE_URL`, `PRIVATE_API_URL` — URLs internas (service discovery de Dokploy).

## 4. Checklist antes del primer push a `main`

- [ ] `pnpm prod:up` levanta los 5 servicios sin errores y `prod:health` muestra todos `healthy`
- [ ] Smoke test de `/health` del AI y root de las APIs responde 200
- [ ] `.env.prod` está en `.gitignore` (ya lo está vía pattern `.env*`)
- [ ] `MONGO_USER` / `MONGO_PASSWORD` definidos en `.env.prod`
- [ ] GitHub Actions secrets §3.1 cargados
- [ ] Repos `banexcoin-web-client`, `banexcoin-private-api`, `banexcoin-public-api`,
      `banexcoin-ai-api` creados en Docker Hub (o el namespace que uses)
- [ ] Servicios creados en Dokploy con sus env vars (§2) y webhook IDs anotados en
      `release.yml`

## 5. Troubleshooting rápido

| Síntoma                                          | Causa probable                                            |
| ------------------------------------------------ | --------------------------------------------------------- |
| `MONGO_USER required` al `prod:up`               | Falta `.env.prod` o variable sin valor                    |
| Frontend no llega al API en browser              | `NEXT_PUBLIC_API_URL` apunta al host equivocado (build-time, requiere rebuild) |
| Rutas protegidas devuelven 401                   | Falta bearer token Clerk o `CLERK_SECRET_KEY` / `CLERK_JWKS_URL` está mal configurado |
| `private-api` reinicia en loop                   | `CLERK_SECRET_KEY` vacío o MongoDB unreachable — `pnpm prod:logs` |
| `public-api` arranca pero falla en queries       | `prisma generate` no se ejecutó — reconstruir imagen      |
| `ai` healthcheck falla                           | El binding del puerto 8080 (interno) no está activo — revisa `uvicorn` logs |
| MongoDB no levanta tras `prod:nuke`              | Normal — primera corrida crea la DB vacía automáticamente |
