"use client";

import { brand } from "@/lib/brand";
import { useBatchFlow } from "../data/use-batch-flow";
import { brandGradient, consoleMutedText, consoleStatePanel } from "../lib";
import { AppShell } from "./app-shell";
import { ConsoleScreen } from "./console-screen";
import { EmptyState, ErrorState } from "./states";

function LoadingState() {
  return (
    <AppShell>
      <div className={`${consoleStatePanel} max-w-sm p-6 text-center`}>
        <div className="mx-auto h-1.5 w-24 overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full w-2/3 animate-pulse rounded-full ${brandGradient}`}
          />
        </div>
        <p className="mt-5 font-bold">Cargando {brand.consoleTitle}</p>
        <p className={`mt-1 text-sm ${consoleMutedText}`}>
          Cargando el último lote autenticado desde la API pública.
        </p>
      </div>
    </AppShell>
  );
}

function EmptyBatchState() {
  return (
    <AppShell>
      <div className={`${consoleStatePanel} max-w-3xl p-6`}>
        <EmptyState
          title="Todavía no hay lotes disponibles"
          description="La API pública responde, pero todavía no devolvió ningún lote de cashback persistido. Cuando el backend del flujo guarde un lote, esta consola podrá mostrar sus estados de validación, cálculo y exportación."
        />
      </div>
    </AppShell>
  );
}

function ApiErrorState({ message }: { message: string }) {
  return (
    <AppShell>
      <div className={`${consoleStatePanel} max-w-3xl p-6`}>
        <ErrorState message={message} />
      </div>
    </AppShell>
  );
}

export function ConsoleClient({ batchId }: { batchId?: string }) {
  const state = useBatchFlow(batchId);

  if (state.status === "loading") {
    return <LoadingState />;
  }

  if (state.status === "error") {
    return <ApiErrorState message={state.message} />;
  }

  if (state.status === "empty") {
    return <EmptyBatchState />;
  }

  return <ConsoleScreen {...state.data} />;
}
