# Feature Requirements — Tier Configuration

## Goal

Define the UI for reviewing and configuring cashback tiers before calculation.

## Main Feature

The tier configuration screen shows which thresholds and percentages will be used for the batch and
which tier version becomes locked at calculation time.

## P0 Requirements

### 1. Tier Review

- The UI must show each tier name, thresholds, and percentage.
- The UI must communicate that tiers are configuration, not hardcoded copy.

### 2. Version Context

- The UI must show the active tier version when available.
- The UI must communicate that the selected version is locked into the batch once calculation starts.

### 3. Editing Support

- If editing is allowed in MVP, the UI must require explicit confirmation before saving tier changes.

## Non-P0 Features

- advanced historical tier diff tooling
- full simulation sandboxing
