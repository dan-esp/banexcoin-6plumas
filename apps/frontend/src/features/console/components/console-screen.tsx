import { Separator } from "@/components/ui/separator";

import type { ConsoleDataState } from "../data";
import { formatBs, formatCount, formatUsdt } from "../lib";
import { AnomaliesPanel } from "./anomalies-panel";
import { AppShell } from "./app-shell";
import { AuditTimeline } from "./audit-timeline";
import { BrandHeader } from "./brand-header";
import { CalculationReview } from "./calculation-review";
import { ExecutiveSummary } from "./executive-summary";
import { ExportActionCard } from "./export-action-card";
import { KpiCard } from "./kpi-card";
import { ErrorState } from "./states";
import { TierDistribution } from "./tier-distribution";
import { UploadPanel } from "./upload-panel";
import { ValidationBanner } from "./validation-banner";
import { WorkflowStepper } from "./workflow-stepper";

export function ConsoleScreen({
  batch,
  results,
  disbursements,
  anomalies,
  source,
  error,
}: ConsoleDataState) {
  return (
    <AppShell batch={batch} dataSource={source} error={error}>
      {error ? <ErrorState message={error} /> : null}
      <BrandHeader batch={batch} />

      <section className="grid gap-4 xl:grid-cols-4">
        <KpiCard
          label="Total consumption Bs"
          note="+18.2% vs abril"
          value={formatBs(batch.totals.consumptionBs)}
        />
        <KpiCard
          label="Cashback liability"
          note="Ready for finance review"
          tone="info"
          value={formatUsdt(batch.totals.cashbackUsdt)}
        />
        <KpiCard
          label="Valid QR payments"
          note="98.1% passed validation"
          value={formatCount(batch.totals.transactions)}
        />
        <KpiCard
          label="Blocked rows"
          note="Export blocked until resolved"
          tone="danger"
          value={formatCount(batch.validation.blockedRows)}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
        <WorkflowStepper batch={batch} />
        <TierDistribution />
      </section>

      <ExecutiveSummary batch={batch} />
      <UploadPanel batch={batch} />
      <ValidationBanner batch={batch} />
      <AnomaliesPanel initialAnomalies={anomalies} />
      <CalculationReview batch={batch} results={results} />
      <ExportActionCard batch={batch} disbursements={disbursements} />
      <AuditTimeline batch={batch} />

      <Separator className="bg-white/10" />
      <p className="pb-8 text-center text-white/40 text-xs">
        BanexReintegra is an internal operations surface for USDT cashback
        review. It does not execute payments or replace deterministic private
        API controls.
      </p>
    </AppShell>
  );
}
