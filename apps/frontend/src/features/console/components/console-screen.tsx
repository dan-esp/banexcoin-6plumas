import { Separator } from "@/components/ui/separator";
import { brand } from "@/lib/brand";

import type { ConsoleDataState } from "../data";
import { consoleMutedText, formatBs, formatCount, formatUsdt } from "../lib";
import { AnomaliesPanel } from "./anomalies-panel";
import { AppShell } from "./app-shell";
import { AuditTimeline } from "./audit-timeline";
import { BrandHeader } from "./brand-header";
import { CalculationReview } from "./calculation-review";
import { ExecutiveSummary } from "./executive-summary";
import { KpiCard } from "./kpi-card";
import { OracleContextCard } from "./oracle-context-card";
import { ErrorState } from "./states";
import { TransactionsTable } from "./transactions-table";
import { ValidationBanner } from "./validation-banner";
import { WorkflowStepper } from "./workflow-stepper";

export function ConsoleScreen({
  batch,
  results,
  anomalies,
  transactions,
  oracle,
  error,
}: ConsoleDataState) {
  return (
    <AppShell batch={batch}>
      {error ? <ErrorState message={error} /> : null}
      <BrandHeader batch={batch} />

      <section className="grid gap-4 xl:grid-cols-4">
        <KpiCard
          label="Consumo total en Bs"
          note="+18.2% vs abril"
          value={formatBs(batch.totals.consumptionBs)}
        />
        <KpiCard
          label="Pasivo de cashback"
          note="Listo para revisión de finanzas"
          tone="info"
          value={formatUsdt(batch.totals.cashbackUsdt)}
        />
        <KpiCard
          label="Pagos QR válidos"
          note="98.1% pasó validación"
          value={formatCount(batch.totals.transactions)}
        />
        <KpiCard
          label="Filas bloqueadas"
          note="La exportación sigue bloqueada"
          tone="danger"
          value={formatCount(batch.validation.blockedRows)}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <WorkflowStepper batch={batch} />
        <ExecutiveSummary batch={batch} />
      </section>

      <OracleContextCard oracle={oracle} />
      <ValidationBanner batch={batch} />
      <AnomaliesPanel initialAnomalies={anomalies} />

      <CalculationReview batch={batch} results={results} />
      <section className="grid gap-4">
        <div>
          <h2 className="font-bold text-2xl text-foreground">
            Transacciones visibles del lote
          </h2>
          <p className={`mt-2 text-sm ${consoleMutedText}`}>
            Vista de lectura para contrastar QR, validación y señales de
            anomalía sin salir del flujo operativo.
          </p>
        </div>
        <TransactionsTable transactions={transactions} />
      </section>
      <AuditTimeline batch={batch} />

      <Separator />
      <p className={`pb-8 text-center text-xs ${consoleMutedText}`}>
        {brand.consoleTitle} es la superficie operativa interna de{" "}
        {brand.consoleDescriptor} para revisar cashback en USDT. No ejecuta
        pagos ni reemplaza los controles determinísticos de la API privada.
      </p>
    </AppShell>
  );
}
