# Feature Requirements — Validation Review

## Goal

Define the UI for parsing progress, validation outcomes, and blocked-row review.

## Main Feature

The validation review screen shows whether the batch can proceed to cashback calculation and why.

## P0 Requirements

### 1. Parsing Progress

- The UI must show progress or stage feedback while backend parsing and validation run.
- The UI must surface the main processing stages:
  - read workbook
  - map columns
  - normalize rows
  - run validation rules

### 2. Validation Summary

- The UI must show counts for valid, warning, and blocked rows.
- The UI must show duplicates and excluded rows where available.

### 3. Issue Review

- The UI must show a review table of validation issues.
- Each issue must show severity and a human-readable explanation.
- Blocked conditions must be visually dominant.

### 4. Blocked Resolution Support

- If the backend supports row decisions, the UI must show keep or exclude actions plus a reason field.
- The calculate action must remain unavailable while unresolved blocked conditions exist.

## Non-P0 Features

- spreadsheet-like editing
- client-authored validation rules
