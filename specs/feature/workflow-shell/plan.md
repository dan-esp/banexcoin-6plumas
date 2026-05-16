# Implementation Plan — Workflow Shell

## Objective

Build the frontend frame for this feature so it can host all core cashback workflow states.

## Recommended Build Order

### 1. Replace Starter Page

- remove default Next.js starter content
- add app-level layout for operations console framing

### 2. Batch State Frame

- add batch context header
- add workflow state badge
- add primary CTA slot

### 3. Main Surface Layout

- add content regions for current feature step
- add secondary context region for workflow progress and status metadata

## Done Criteria

- the frontend opens into an operations console shell
- the shell can render a visible batch state and next action
- later screens can mount into the shell without changing the layout model
