# Implementation Plan — Tier Configuration

## Objective

Build the tier review surface before calculation is triggered.

## Recommended Build Order

### 1. Tier Read View

- show tier rows with thresholds and percentages
- show active version metadata

### 2. Lock Messaging

- add messaging that explains the tier version lock at calculation time

### 3. Editing Flow

- wire edit state only if backend configuration support exists for MVP

## Done Criteria

- a reviewer can see which tier configuration version applies to the batch
- the UI makes clear that calculated batches do not silently change when tiers change later
