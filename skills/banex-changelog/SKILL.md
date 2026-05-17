---
name: banex-changelog
description: Maintain BanexReintegra change notes and release summaries from git status, diffs, recent commits, and semantic-release configuration. Use when asked to update CHANGELOG.md, summarize recent work, prepare release notes, or explain what changed without inventing shipped behavior.
---

# Banex Changelog

Use this skill to maintain human-readable change notes for BanexReintegra contributors.

## Source checks

Before writing changelog text, inspect:

- `git status --short`
- `git diff --name-status`
- `git log --oneline -n 20`
- `release.config.mjs`
- Relevant touched files when a change is unclear

## Rules

- Keep entries concise and grouped by Conventional Commit intent: `feat`, `fix`, `docs`, `chore`, `infra`.
- Never claim a feature is implemented unless code or docs clearly show it.
- Label uncertain work as `Pending verification`.
- Use English by default.
- Preserve Spanish when summarizing Spanish-only docs or user-facing Spanish content.
- Treat semantic-release as the release automation source. `CHANGELOG.md` is for team coordination and review notes.

## CHANGELOG.md format

Use this structure:

```md
# Changelog

## Unreleased

### feat

- ...

### fix

- ...

### docs

- ...

### chore

- ...

### infra

- ...
```

Remove empty sections only if doing so improves readability.

## Output checklist

- Mention test or verification evidence when available.
- Keep pending product decisions out of changelog entries; send those to `TODO.md` questions.
- Avoid duplicate entries for the same change.
