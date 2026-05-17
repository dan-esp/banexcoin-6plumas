import type { PublicBatchDto } from "../data";

export const workflowSteps = [
  "Cargado",
  "Validado",
  "Calculado",
  "En revisión",
  "Aprobado",
  "Exportado",
] as const;

export type StatusTone = "success" | "info" | "warning" | "danger" | "neutral";

export function resultTone(status: string): StatusTone {
  const normalized = status.toLowerCase();

  if (normalized === "blocked") return "danger";
  if (normalized === "warning") return "warning";
  if (normalized === "ready") return "success";

  return "neutral";
}

export function getCurrentWorkflowIndex(status: string) {
  const index = workflowSteps.indexOf(status as (typeof workflowSteps)[number]);

  return index >= 0 ? index : 0;
}

export function getNextAction(batch: PublicBatchDto) {
  if (batch.validation.blockedRows > 0) {
    return {
      label: "Revisar filas bloqueadas",
      description:
        "Resuelve los bloqueos de validación antes de aprobar o exportar.",
      tone: "danger" as const,
      enabled: true,
    };
  }

  if (!batch.approval.approved) {
    return {
      label: "Enviar a finanzas",
      description:
        "La validación está limpia; la aprobación de finanzas es el siguiente control.",
      tone: "warning" as const,
      enabled: true,
    };
  }

  if (!batch.export.ready) {
    return {
      label: "Preparar exportación",
      description:
        "La aprobación ya fue registrada; ahora se puede habilitar la generación del archivo.",
      tone: "info" as const,
      enabled: true,
    };
  }

  return {
    label: "Generar CSV",
    description: "La exportación de pagos para BanexTransfer está lista.",
    tone: "success" as const,
    enabled: true,
  };
}
