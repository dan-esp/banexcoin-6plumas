# BanexReintegra Manager Tech Stack

## Overview

The stack should optimize for hackathon delivery, clear business logic, and financial traceability.

The recommended shape is:

- One web frontend
- One backend
- One relational database

This project should use a modular monolith, not microservices. The workflow is tightly connected: import, validation, calculation, approval, and export all belong to the same financial process.

## Frontend

Recommended frontend:

- Next.js
- TypeScript
- Tailwind CSS
- TanStack Query
- Recharts

Why:

- Next.js gives fast setup, solid routing, and a good developer experience for an internal dashboard.
- TypeScript helps keep UI state and API contracts explicit.
- Tailwind is fast for hackathon delivery.
- TanStack Query is enough for batch lists, dashboards, validation results, and calculation views.
- Recharts is sufficient for KPI and tier-distribution charts.

Frontend responsibility:

- Upload report
- Show validation results
- Display batch states
- Review calculation outputs
- Support approval and export flows
- Show dashboard KPIs

## Backend

Recommended backend:

- One backend only
- ASP.NET Core Web API
- C#
- Entity Framework Core

Why one backend:

- Simpler deployment
- Less coordination overhead
- Better consistency for financial state
- Faster to build in a hackathon
- Easier to audit a single controlled workflow

Recommended internal modules:

- ETL
- Rate Oracle
- Cashback Engine
- Export Engine
- Analytics
- Approval and Audit

If background processing is needed later, add jobs inside the same backend first. Do not split into a second backend unless scale or operational complexity proves it necessary.

## Database

Recommended database:

- PostgreSQL

Why:

- Reliable relational model
- Good fit for batches, transactions, tiers, approvals, and audit logs
- Easy local and cloud setup

Suggested environments:

- Local development: Docker PostgreSQL
- Cloud option: Neon, Supabase, or Railway Postgres

## File Processing

Recommended libraries for the backend:

- ClosedXML or EPPlus for Excel
- CsvHelper for CSV import/export

These are central because the product depends on uploaded operational files and export-ready payout outputs.

## AI

AI is optional and should stay outside the money-calculation path.

If included:

- Use it only for summaries, anomaly explanations, and executive text
- Keep all financial calculations deterministic in backend code

## Final Direction

The default technical direction is:

```txt
Next.js frontend
-> ASP.NET Core modular monolith backend
-> PostgreSQL database
```

For this project, the answer to "how many backends?" is:

```txt
One backend.
```
