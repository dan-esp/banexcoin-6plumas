# BanexReintegra Manager Design

## Product Positioning

BanexReintegra Manager is an internal fintech operations platform for turning monthly Banexcoin QR payment reports into validated, auditable, BanexTransfer-ready USDT cashback payouts.

The design should feel operational, controlled, and finance-grade. It is not a marketing site and not a consumer wallet. The primary experience is a dense but calm work surface for Operations, Finance, and Management.

Core product promise:

> From manual cashback calculation to automated monthly reintegro operations.

## Figma Source

Current Figma file:

https://www.figma.com/design/YEhYeg50lqktMsnarnoPbd

Primary pages:

- `BanexReintegra Prototype v2`
- `Design System v2`
- `Pipelines and States`
- `Main User Flows v2`
- `UX UI Motion Upgrade`

## Design Principles

1. One operational state is always visible.
   Every screen must show the current monthly batch status: Uploaded, Validating, Validation Failed, Validated, Calculated, Under Review, Approved, or Exported.

2. The next action must be obvious.
   Each batch state should have one primary CTA. Examples: Upload report, Resolve blocked rows, Calculate cashback, Send to finance, Approve liability, Generate CSV.

3. Validation comes before payout.
   Cashback totals and exports must not visually compete with unresolved validation issues. Blocked rows should take priority over optimistic dashboard metrics.

4. Finance data must be exact.
   USDT payout amounts should preserve configured decimal precision. Totals, tier percentages, exchange rates, and assumptions should be visible and traceable.

5. Auditability is part of the UI.
   Important actions should imply an audit event: upload, validation, row exclusion, tier version lock, calculation, finance approval, export generation.

6. Motion should explain state change.
   Motion is used for progress, continuity, and attention. It should not feel decorative or playful.

## Google / Material-Informed Best Practices

The design follows Material-style product guidance adapted for a desktop fintech operations tool:

- Use a consistent color system with semantic roles for surface, primary action, success, warning, error, and information.
- Use components consistently: buttons for actions, chips/badges for compact status, progress indicators for processing, cards for grouped content, and tables for financial review.
- Preserve hierarchy through typography, spacing, elevation, and color contrast.
- Use motion to support continuity between screens and states.
- Provide accessible state communication with labels and text, not color alone.

## Banexcoin-Inspired Palette

The Figma uses a restrained Banexcoin-inspired palette:

| Token | Purpose | Approx Hex |
| --- | --- | --- |
| `banex-dark` | Sidebar, deep navigation, high-trust surfaces | `#002C26` |
| `banex-deep` | Secondary dark surfaces | `#003E37` |
| `banex-action` | Primary CTA, success, completed states | `#006E5E` |
| `banex-mint` | Success backgrounds, selected states | `#E0F6ED` |
| `coin-gold` | USDT/cashback emphasis, approval highlight | `#ECA62A` |
| `gold-soft` | Warning or approval background | `#FFF1CC` |
| `blocked-red` | Blocked/export-lock/error states | `#C71E29` |
| `info-blue` | Informational states and analytics | `#0F43B3` |
| `canvas-bg` | App background | `#F2F6F9` |
| `surface` | Cards, tables, panels | `#FFFFFF` |

Usage rules:

- Use Banex green for primary actions and successful operational progress.
- Use gold for cashback/USDT emphasis and finance review moments.
- Use red only when export or payout safety is affected.
- Do not rely on color alone. Pair severity color with text labels such as `Blocked`, `Warning`, `Gate clear`, or `Export locked`.

## Typography

Recommended font: `Inter`.

Suggested scale:

| Style | Use |
| --- | --- |
| 40-48 Bold | Prototype start / product title |
| 28-32 Bold | Major workflow state titles |
| 22-24 Bold | Screen headings and panel headings |
| 16-18 Semi Bold | Section headings, table emphasis |
| 13-14 Medium | Body copy, table rows, labels |
| 11-12 Semi Bold | Badges, metadata, compact controls |

Rules:

- Financial values should be large enough to scan but never wrap inside KPI cards.
- Tables should prioritize legibility over decorative spacing.
- Button text should be short and action-oriented.

## Core Screens

### Prototype Start

Purpose:

- Introduce the product narrative.
- Explain the demo path.
- Establish the internal operations context.

Primary CTA:

- Start prototype.

### Upload Report

Purpose:

- Upload Excel/CSV monthly QR transaction report.
- Confirm selected month and expected input type.
- Keep system independence clear: manually uploaded files only.

Key components:

- File dropzone
- Pre-import checks
- File type hint
- Period indicator

States:

- Idle
- Drag over
- Parsing
- File rejected
- File accepted

### Parsing Report

Purpose:

- Communicate backend work before validation appears.

Processing steps:

- Read workbook
- Map columns
- Normalize rows
- Run validation rules

Motion:

- Progress bar
- Short timed transition to validation
- Shimmer or loading state on mapping rows

### Validation Blocked

Purpose:

- Show validation severity.
- Prevent export when critical issues exist.

Severity types:

- Valid
- Warning
- Error
- Blocked

Required behavior:

- Blocked rows disable export.
- Warning rows remain visible but can continue.
- The UI explains why the batch is blocked.

### Resolve Blocked Row

Purpose:

- Provide an operational decision surface for duplicate or invalid rows.

Required elements:

- Source row comparison
- Keep/exclude action
- Reason for decision
- Audit note

### Validation Clear

Purpose:

- Confirm blocked rows are resolved.
- Move the user toward calculation.

Primary CTA:

- Calculate.

### Tier Configuration

Purpose:

- Configure cashback levels.
- Preview impact before calculation.

Rules:

- Tiers must not be hardcoded.
- Tier version should be saved and locked into the batch once calculation starts.

Demo tiers:

- Nivel 1: Bs 100 - Bs 999.99 -> 1%
- Nivel 2: Bs 1,000 - Bs 4,999.99 -> 1.5%
- Nivel 3: Bs 5,000+ -> 2%

### Calculating Cashback

Purpose:

- Show that the system is grouping users, applying tiers, and computing Bs/USDT amounts.

Processing steps:

- Group users
- Apply tiers
- Calculate Bs
- Calculate USDT

### Calculation Results

Purpose:

- Review user-level cashback outputs before finance approval.

Table columns:

- User
- QR count
- Consumed Bs
- Tier
- Reintegro USDT
- Review state

Important:

- High-value users and warning-attached users should be easy to identify.
- Row selection should open a calculation trace drawer.

### Finance Approval

Purpose:

- Finance reviews total liability, assumptions, warnings, and tier version.

Finance checklist:

- Tier rules validated
- USDT decimal precision confirmed
- Warnings reviewed and accepted
- Total liability reconciled
- Payout period confirmed

Primary CTA:

- Approve liability.

### Batch Approved

Purpose:

- Confirm approval.
- Show that tier version and finance sign-off were recorded.
- Unlock export.

### Export Center

Purpose:

- Generate operational reports and payout files.

Outputs:

- Detailed Cashback Report
- BanexTransfer Payout File
- Executive Summary

Export readiness gate:

- Validation clear
- Finance approved
- Tier locked
- Audit ready

### Generating Payout CSV

Purpose:

- Communicate file generation progress.

Processing steps:

- Write receiver accounts
- Write USDT amounts
- Create references
- Attach period month
- Generate checksum
- Write audit event

### Export Complete

Purpose:

- Confirm export is ready.
- Show file metadata and checksum.
- Provide next action to download CSV or open audit log.

### Management Dashboard

Purpose:

- Show executive KPIs after export.

KPIs:

- Users reached
- QR consumption
- Cashback paid
- Audit events

Management views:

- Users by tier
- Total consumption
- Total cashback
- Validation warnings/errors
- Export status

## Main User Flows

### Operations Flow

1. Upload monthly QR report.
2. Review parsing preview.
3. Review validation results.
4. Resolve blocked rows.
5. Trigger cashback calculation.
6. Review calculation results.
7. Generate BanexTransfer payout CSV after approval.
8. Download/export reports.

### Finance Flow

1. Review total cashback liability in Bs and USDT.
2. Confirm tier version and business assumptions.
3. Review warnings.
4. Approve or request changes.
5. Lock liability approval into audit trail.

### Management Flow

1. Review monthly consumption KPIs.
2. Check cashback payout totals.
3. See users by tier.
4. Review validation quality and audit events.
5. Use executive summary for adoption and operational reporting.

### System Pipeline

1. Uploaded
2. Validating
3. Validation Failed
4. Validated
5. Calculated
6. Under Review
7. Approved
8. Exported

## Component System

### Buttons

Primary:

- Banex green.
- Used for main workflow actions.

Secondary:

- White surface with border.
- Used for alternative or lower-risk actions.

Danger:

- Red.
- Used for resolving blocked rows or excluding data.

### Status Pills

Used for:

- Batch state
- Severity
- Export readiness
- Report type

Examples:

- Under Review
- Blocked
- Validated
- Operational file
- Audit event recorded

### KPI Cards

Used for:

- Consumption Bs
- Cashback USDT
- Valid rows
- Blocked rows
- Audit events

Rules:

- Include a concise supporting note.
- Use semantic color dot, not large decorative graphics.

### Tables

Used for:

- Validation rows
- Calculation results
- Export files
- Audit events

Rules:

- Use sticky headers in implementation.
- Support row focus and keyboard navigation.
- Use row details/drawer for traceability.

### Drawers and Modals

Use drawers for:

- User calculation trace
- Row-level review

Use modals for:

- Processing states
- Export generation

## Motion Design

Motion should communicate system state and reduce uncertainty.

Recommended tokens:

| Interaction | Motion |
| --- | --- |
| Screen transition | Smart animate / fade + 12px slide, 220ms ease-out |
| Upload drag over | Dropzone expands slightly, 160ms |
| Parsing | Progress bar with subtle shimmer, auto-advance |
| Blocked severity | Single red pulse, 320ms |
| Calculation | Progress bar and step chips, auto-advance |
| Row trace drawer | Slide in from right, 180-240ms |
| Export generation | Modal progress, auto-advance |
| Export complete | Toast slide/fade from top-right |

Accessibility:

- Respect reduced-motion preferences.
- Replace slide transitions with dissolve when reduced motion is enabled.
- Avoid infinite pulsing for risk states.

## Validation UX Rules

Validation should be treated as a core product feature, not an error page.

Rules:

- Show counts for valid, warning, error, and blocked rows.
- Explain why export is locked.
- Provide row-level action paths.
- Preserve warnings in reports.
- Store every exclusion or correction as an audit event.

Critical errors that block export:

- Missing transaction ID
- Duplicated transaction ID
- Missing user/account ID
- Missing user/account name
- Amount Bs <= 0
- Amount USDT <= 0
- Exchange rate <= 0
- Transaction outside selected month
- Status not completed
- Service type not Pago QR

## Export UX Rules

Export should feel like a controlled operational handoff.

Rules:

- Do not show payout generation until approval gates are complete.
- Show readiness checklist before export.
- Show file type and purpose.
- Show checksum or generated reference after export.
- Store export event in audit history.

BanexTransfer payout columns:

```csv
receiverAccountId,receiverAccountName,asset,amountUsdt,concept,reference,periodMonth
```

Example:

```csv
123456,Juan Perez,USDT,1.206900,BanexReintegra Mayo 2026,REINTEGRA-2026-05-123456,2026-05
```

## Implementation Notes

Recommended frontend behavior:

- Use route-level transitions between major workflow screens.
- Use mutation/loading states for parsing, validation, calculation, and export.
- Use optimistic UI only for non-financial UI states, not payout approval.
- Persist batch state transitions from the backend.
- Store tier version and validation rules version with each batch.

Recommended frontend components:

- `BatchStatusPill`
- `SeverityCounter`
- `UploadDropzone`
- `ValidationTable`
- `TierConfigTable`
- `CashbackResultsTable`
- `CalculationTraceDrawer`
- `ApprovalChecklist`
- `ExportReadinessGate`
- `AuditTimeline`

## Definition of Done for UI

- The prototype supports the full monthly batch narrative.
- All core user roles are represented.
- Export is impossible from blocked states.
- Tier configuration is visibly versioned/configurable.
- Finance approval is required before export.
- Tables show exact financial values.
- Motion communicates progress without distracting.
- Every critical action implies an audit event.

