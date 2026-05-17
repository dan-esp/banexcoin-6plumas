# Implementation Plan — Validation Review

## Objective

Build the validation review surface that gates calculation.

## Recommended Build Order

### 1. Processing State

- add parsing and validation progress UI

### 2. Summary Surface

- add validation totals and severity summary cards or panels

### 3. Issues Table

- add issue listing with severity, explanation, and row reference

### 4. Blocked Resolution Actions

- add resolution inputs and backend action wiring if supported

## Done Criteria

- an operator can understand why a batch is blocked
- the frontend only exposes calculation when validation gates are clear
