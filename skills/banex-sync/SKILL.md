---
name: banex-sync
description: Synchronize BanexReintegra constitution, specs, docs, README, AGENTS.md, and CLAUDE.md. Use when asked to sync specs, sync work, sync constitution, update docs after code changes, or resolve stale project guidance.
---

# Banex Sync

Use this skill to keep project guidance aligned across agents and documents.

## Authority order

When sources disagree:

1. `constitution/` is product authority.
2. Live repo structure is technical evidence.
3. `CLAUDE.md` and `AGENTS.md` are agent guidance and must reflect both.
4. `docs/` explains current architecture and research.
5. `specs/` turns decisions into implementable feature requirements.

Do not silently overwrite product intent with current code if the code is incomplete. Flag the gap.

## Standard sync pass

Inspect:

- `git status --short`
- `find . -maxdepth 3 -type f`
- `constitution/*.md`
- `specs/feature/*.md`
- `docs/README.md`
- `README.md`
- `AGENTS.md`
- `CLAUDE.md`
- Root manifests and service manifests when stack details changed

## Common drift to fix

- `files/` references when source documents now live in `resources/`.
- Old claims that the repo has only two API apps.
- Empty specs that should be marked draft or populated.
- Docs claiming starter template services already implement product behavior.
- Missing links between roadmap, mission, architecture, and agent guidance.
- New services missing from `.github/filters.yml`, CI matrices, docs, or agent guidance.

## Rules

- Preserve Spanish docs in Spanish and English docs in English unless asked otherwise.
- Keep implementation claims precise: say "planned" or "starter shell" when code is not built.
- Prefer small, targeted edits over rewriting complete docs.
- If a conflict requires a product decision, add it to `TODO.md` under `Questions`.
- After syncing, run a stale-reference search such as:

```sh
rg "files/|two API|apps/api/ai|resources/" AGENTS.md CLAUDE.md README.md docs constitution specs
```

Interpret matches; do not remove valid references just because they match.
