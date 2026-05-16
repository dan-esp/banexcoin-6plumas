---
name: banex-todo
description: Maintain BanexReintegra TODO.md as a shared execution board from constitution, specs, docs, current repo state, and open questions. Use when asked to create, update, triage, or sync project tasks.
---

# Banex TODO

Use this skill to keep `TODO.md` useful for Codex, Claude, and human contributors.

## Source checks

Review the smallest useful set of sources:

- `constitution/mission.md`
- `constitution/roadmap.md`
- `constitution/design.md`
- `constitution/tech-stack.md`
- `docs/README.md`
- `docs/architecture-sketch.md`
- `CLAUDE.md`
- `AGENTS.md`
- `git status --short`

Load deeper docs only when a task needs detail.

## Board structure

Maintain exactly these top-level sections:

- `Now`
- `Next`
- `Blocked`
- `Done`
- `Questions`

## Rules

- Keep tasks actionable and owner-neutral.
- Order tasks by demo priority, not by file order.
- Separate implementation tasks from product questions.
- Move completed work to `Done` with a short date/context note instead of deleting it.
- Do not mark starter templates as complete product functionality.
- Prefer one-line tasks with clear acceptance signals.

## Task wording

Good:

- `Implement Pago QR parser in private API; done when provided workbook rows normalize into cashback transaction DTOs.`

Avoid:

- `Work on backend.`
- `Finish everything.`
- `Build AI magic.`

## Output checklist

- The `Now` section should stay small enough to execute in the next work session.
- `Blocked` should include the missing decision or dependency.
- `Questions` should contain product/business decisions, not implementation reminders.
