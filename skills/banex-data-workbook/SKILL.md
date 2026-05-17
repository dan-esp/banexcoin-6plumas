---
name: banex-data-workbook
description: Inspect, explain, or map the Banexcoin source workbook and resource files for BanexReintegra. Use when working with resources/*.xlsx, Pago QR columns, dataset statistics, sheet reconciliation, or source-to-DTO field mapping.
---

# Banex Data Workbook

Use this skill for source workbook inspection and data mapping.

## Product boundary

The system is independent and file-driven. Source files live in `resources/` and are reference inputs.

Primary cashback source:

- sheet: `Pago QR`
- service: `S-001`
- status: `Completed`

Optional reconciliation source:

- `EXTRACTO DE PAGOS`

## Source checks

Before making data claims, inspect:

- `resources/`
- `docs/architecture-sketch.md`
- `docs/tech-notes.md`
- `docs/README.md`
- `specs/feature/requirements.md`
- `specs/feature/validation.md`

If calculating new workbook statistics, use a reproducible command or script and summarize the method.

## Expected source columns

Observed `Pago QR` columns include:

- `Numero de cotizacion`
- `Fecha de creacion`
- `Estado`
- `Side Cliente`
- `Creado por`
- `Numero de Cuenta`
- `Monto intercambio`
- `Monto Pagado`
- `Moneda`
- `Precio`
- `Comision`
- `Fecha de actualizacion`
- `Transaccion Id`
- `Tipo de servicio`
- `OMS`

Column accents may vary by parser. Normalize names before matching.

## Mapping defaults

- account ID: `Numero de Cuenta`
- account name or payout identity: `Creado por`
- Bs amount: `Monto Pagado`
- USDT amount: `Monto intercambio`
- exchange rate: `Precio`
- transaction ID: `Transaccion Id`
- date: `Fecha de creacion`
- service code: `Tipo de servicio`

## Rules

- Do not edit source workbooks.
- Do not commit generated payout files.
- Keep derived analysis traceable to the workbook and sheet used.
- If workbook facts conflict with constitution decisions, record the conflict instead of changing product rules silently.
