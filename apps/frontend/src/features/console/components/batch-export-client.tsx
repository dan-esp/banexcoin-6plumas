"use client";

import { useBatchFlow } from "../data/use-batch-flow";
import { consolePageShell, consoleStatePanel } from "../lib";
import { AppShell } from "./app-shell";
import { ExportActionCard } from "./export-action-card";
import { EmptyState, ErrorState } from "./states";

export function BatchExportClient({ batchId }: { batchId: string }) {
  const state = useBatchFlow(batchId);

  if (state.status === "loading") {
    return (
      <main className={consolePageShell}>
        <p className="font-bold">Cargando centro de exportación</p>
      </main>
    );
  }

  if (state.status === "error") {
    return (
      <main className={consolePageShell}>
        <div className={`${consoleStatePanel} max-w-3xl p-6`}>
          <ErrorState message={state.message} />
        </div>
      </main>
    );
  }

  if (state.status === "empty") {
    return (
      <main className={consolePageShell}>
        <div className={`${consoleStatePanel} max-w-3xl p-6`}>
          <EmptyState
            title="No hay un lote disponible"
            description="No se pudo cargar el lote seleccionado desde la API pública."
          />
        </div>
      </main>
    );
  }

  return (
    <AppShell batch={state.data.batch}>
      <ExportActionCard
        batch={state.data.batch}
        disbursements={state.data.disbursements}
      />
    </AppShell>
  );
}
