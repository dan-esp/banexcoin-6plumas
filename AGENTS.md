# Repository Guidelines

## Project Structure & Module Organization
This repository is organized around two API apps plus planning and reference material.

- `apps/api/private/`: NestJS private API in TypeScript. Main code lives in `src/`; unit specs sit beside source as `*.spec.ts`; end-to-end tests live in `test/`.
- `apps/api/public/`: Hono public API running on Bun. Current entrypoint is `src/index.ts`.
- `specs/` and `constitution/`: product requirements, validation notes, roadmap, and design decisions.
- `files/`: source business documents and PDFs. Treat these as reference inputs, not application assets.

## Build, Test, and Development Commands
Run commands from the relevant app directory; there is no root workspace script yet.

- `cd apps/api/private && pnpm install`: install Nest dependencies.
- `cd apps/api/private && pnpm run start:dev`: run the private API with hot reload.
- `cd apps/api/private && pnpm run build`: compile the Nest app to `dist/`.
- `cd apps/api/private && pnpm run lint`: run ESLint with autofixes.
- `cd apps/api/private && pnpm run test`, `pnpm run test:e2e`, `pnpm run test:cov`: unit, end-to-end, and coverage runs.
- `cd apps/api/public && bun install && bun run dev`: run the public Hono API locally on `http://localhost:3000`.

## Coding Style & Naming Conventions
Follow the style already present in each app.

- Private API: TypeScript, 2-space indentation, Nest class patterns (`AppController`, `AppService`), and Prettier formatting enforced through ESLint.
- Public API: concise TypeScript with semicolon-free style as currently used in `src/index.ts`.
- Prefer descriptive file names by role: `*.controller.ts`, `*.service.ts`, `*.e2e-spec.ts`.

## Testing Guidelines
Testing is currently defined only for `apps/api/private/`.

- Place unit tests next to source files as `*.spec.ts`.
- Keep API-level tests in `apps/api/private/test/` as `*.e2e-spec.ts`.
- Run `pnpm run test:cov` before opening a PR for backend changes. Add tests for new routes, services, and regression fixes.

## Commit & Pull Request Guidelines
Git history currently uses short Conventional Commit subjects such as `feat: add public api`. Continue with prefixes like `feat:`, `fix:`, and `docs:`.

PRs should include a clear summary, impacted paths, test evidence, and linked planning material from `specs/` when relevant. For API behavior changes, include sample request/response payloads or screenshots from local verification.

## Security & Configuration Tips
Keep secrets and environment-specific settings out of the repo. Do not commit generated reimbursement data or edited source documents under `files/`; store derived outputs in ignored locations unless explicitly required.
