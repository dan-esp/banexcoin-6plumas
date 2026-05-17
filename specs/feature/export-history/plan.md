# Implementation Plan — Export and Batch History

## Objective

Build the final workflow step that generates the payout file and exposes enough history for audit.

## Recommended Build Order

### 1. Export Status Surface

- add export CTA and locked/ready/loading/completed states

### 2. Export Summary

- show deterministic export metadata after success

### 3. Batch History Panel

- show key workflow events for traceability

## Done Criteria

- an operator can tell whether export is still blocked or ready
- after export, the UI exposes enough metadata for operational follow-up
