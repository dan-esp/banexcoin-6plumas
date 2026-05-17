# Feature Requirements — Export and Batch History

## Goal

Define the UI for generating the BanexTransfer export and reviewing batch history after approval.

## Main Feature

The export screen allows operators to generate a deterministic payout file from an approved batch
and inspect the key batch events that produced it.

## P0 Requirements

### 1. Export Action

- The UI must only expose export as available for approved batches.
- The UI must show export status before, during, and after generation.

### 2. Export Summary

- The UI must show exported accounts count, total cashback `USDT`, batch period, and export metadata when available.

### 3. Batch History Preview

- The UI must show key workflow events such as upload, validation, calculation, payout FX lock, approval, and export.

## Non-P0 Features

- downstream execution confirmation from BanexTransfer
- external reconciliation workflows
