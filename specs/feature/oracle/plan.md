# Implementation Plan — Oracle

## Objective

Build the payout FX feature so cashback conversion remains deterministic, reviewable, and auditable.

## Recommended Build Order

### 1. Provider Interface

- define a configurable oracle provider contract in the private API
- return structured FX data with rate, source, timestamps, and status

### 2. Batch FX Persistence

- add batch fields for locked payout FX context
- persist live-fetch and manual-override metadata

### 3. Lock Flow

- implement the operation that locks payout FX onto a batch
- ensure export reuses the locked rate rather than refetching

### 4. Manual Override Flow

- implement authorized manual override handling
- require operator identity, reason, and timestamp

### 5. Review Integration

- expose locked payout FX context to calculation review and finance approval flows
- surface whether the rate was live or manually overridden

## Done Criteria

- the private API can fetch current payout FX from a configured provider
- a batch can lock one payout FX context before approval
- approved and exported batches remain traceable to the locked payout FX context
- manual overrides are auditable and explicit

## Open Decisions

- Which provider is the operational source of truth for `USDT/BOB`
- Whether the rate should be locked during calculation or in an explicit review step immediately
  before approval
- Which roles are allowed to apply manual overrides
- What freshness window and sanity bounds should block approval

