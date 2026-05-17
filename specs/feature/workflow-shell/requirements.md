# Feature Requirements — Workflow Shell

## Goal

Define the persistent application shell for the internal operations console.

## Main Feature

The shell keeps operators oriented around the current batch, current workflow state, and next safe
action.

## P0 Requirements

### 1. Global App Frame

- The frontend must replace the default Next.js starter screen.
- The app must expose a persistent internal-product frame.
- The frame must support a main work surface plus persistent batch context.

### 2. Batch Context Header

- The shell must show the current batch name or selected period.
- The shell must show the current batch status.
- The shell must show the primary CTA for the next valid action.
- The shell must keep key batch metadata visible while the user moves through the workflow.

### 3. Workflow State Visibility

- One operational state must always be visible.
- The shell must support, at minimum:
  - `uploaded`
  - `validating`
  - `validation_failed`
  - `validated`
  - `calculated`
  - `fx_locked`
  - `under_review`
  - `approved`
  - `exported`

### 4. Action Guidance

- The primary CTA must change with the current workflow state.
- Invalid actions must be visibly disabled with an explanation.
- The shell must not visually prioritize optimistic payout metrics over blocked validation issues.

## Non-P0 Features

- advanced multi-workspace navigation
- analytics-first homepage before the workflow exists
