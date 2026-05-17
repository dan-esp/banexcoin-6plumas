"use client";

import { useBatchFlow } from "../data/use-batch-flow";
import { consolePageShell, consoleStatePanel } from "../lib";
import { AppShell } from "./app-shell";
import { CalculationReview } from "./calculation-review";
import { EmptyState, ErrorState } from "./states";

export function BatchResultsClient({ batchId }: { batchId: string }) {
  const state = useBatchFlow(batchId);

  if (state.status === "loading") {
    return (
      <main className={consolePageShell}>
        <p className="font-bold">Cargando resultados del lote</p>
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
      <CalculationReview
        batch={state.data.batch}
        results={state.data.results}
      />
    </AppShell>
  );
}
