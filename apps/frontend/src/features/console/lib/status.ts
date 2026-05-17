import type { PublicBatchDto } from "../data";

export const workflowSteps = [
  "Uploaded",
  "Validated",
  "Calculated",
  "Under Review",
  "Approved",
  "Exported",
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
      label: "Review blocked rows",
      description: "Resolve validation blockers before approval or export.",
      tone: "danger" as const,
      enabled: true,
    };
  }

  if (!batch.approval.approved) {
    return {
      label: "Send to finance",
      description: "Validation is clear; finance approval is the next gate.",
      tone: "warning" as const,
      enabled: true,
    };
  }

  if (!batch.export.ready) {
    return {
      label: "Prepare export",
      description: "Approval is recorded; export generation can be unlocked.",
      tone: "info" as const,
      enabled: true,
    };
  }

  return {
    label: "Generate CSV",
    description: "BanexTransfer payout export is ready.",
    tone: "success" as const,
    enabled: true,
  };
}
