"use client";

import { AlertTriangle, CheckCircle2, Sparkles, XCircle } from "lucide-react";
import { useCallback, useMemo, useState, useTransition } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useApiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";

import type { PublicAnomalyDto } from "../data";
import { formatBs, formatUsdt } from "../lib";

function formatScore(score: number) {
  return score.toFixed(4);
}

function shortDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function severityFromScore(score: number): "critical" | "high" | "medium" {
  if (score <= -0.2) return "critical";
  if (score <= -0.1) return "high";
  return "medium";
}

const severityTone: Record<
  ReturnType<typeof severityFromScore>,
  { label: string; tone: "danger" | "warning" | "info" }
> = {
  critical: { label: "Critical", tone: "danger" },
  high: { label: "High", tone: "warning" },
  medium: { label: "Review", tone: "info" },
};

export function AnomaliesPanel({
  initialAnomalies,
}: {
  initialAnomalies: PublicAnomalyDto[];
}) {
  const apiFetch = useApiClient();
  const [items, setItems] = useState<PublicAnomalyDto[]>(initialAnomalies);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTransitionPending, startTransition] = useTransition();

  const open = useMemo(
    () => items.filter((a) => a.review.status === "open"),
    [items],
  );

  const dismiss = useCallback(
    async (anomaly: PublicAnomalyDto) => {
      setError(null);
      setPendingId(anomaly.anomalyId);
      try {
        const response = await apiFetch(
          `/v1/anomalies/${anomaly.anomalyId}/dismiss`,
          {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ reason: "Reviewed in console" }),
          },
        );
        if (!response.ok) {
          throw new Error(`Public API responded with ${response.status}`);
        }
        startTransition(() => {
          setItems((prev) =>
            prev.filter((a) => a.anomalyId !== anomaly.anomalyId),
          );
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to dismiss");
      } finally {
        setPendingId(null);
      }
    },
    [apiFetch],
  );

  return (
    <Card
      className="border-[var(--warning-orange)]/30 bg-white/[0.06] text-white"
      id="anomalies"
    >
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="grid size-10 place-items-center rounded-full bg-[var(--warning-orange)]/15 text-[var(--warning-orange)]">
            <AlertTriangle className="size-5" />
          </span>
          <div>
            <CardTitle className="text-white">
              AI-detected anomalies — needs attention
            </CardTitle>
            <CardDescription className="text-white/52">
              Transactions flagged by the ML anomaly model for human review
              before payout approval.
            </CardDescription>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="info">
            <Sparkles className="mr-1 size-3" />
            Powered by ML · IsolationForest
          </Badge>
          <Badge tone={open.length > 0 ? "danger" : "success"}>
            {open.length} open
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        {error ? (
          <div className="rounded-2xl border border-[var(--blocked-red)]/30 bg-[var(--blocked-red)]/10 px-4 py-2 text-sm text-[var(--blocked-red)]">
            {error}
          </div>
        ) : null}

        {open.length === 0 ? (
          <div className="flex items-center gap-3 rounded-3xl border border-[var(--success)]/25 bg-[var(--success)]/10 px-4 py-5 text-sm text-[var(--success)]">
            <CheckCircle2 className="size-5" />
            <p>
              No open anomalies for this batch. The ML model did not flag any
              transactions, or all flags have been reviewed.
            </p>
          </div>
        ) : (
          open.map((anomaly) => {
            const severity = severityFromScore(anomaly.detection.score);
            const meta = severityTone[severity];
            const isPending =
              pendingId === anomaly.anomalyId || isTransitionPending;

            return (
              <div
                className={cn(
                  "grid gap-4 rounded-3xl border border-white/10 bg-black/24 p-5",
                  "lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center",
                )}
                key={anomaly.anomalyId}
              >
                <div className="grid gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={meta.tone}>{meta.label}</Badge>
                    <Badge tone="neutral">
                      score {formatScore(anomaly.detection.score)}
                    </Badge>
                    <Badge tone="neutral">
                      acct #{anomaly.transaction.accountId}
                    </Badge>
                  </div>
                  <p className="font-bold text-lg text-white">
                    {anomaly.transaction.username}
                  </p>
                  <div className="grid gap-1 text-sm text-white/64 sm:grid-cols-2">
                    <p>
                      <span className="text-white/40">Amount:</span>{" "}
                      {formatBs(anomaly.transaction.amounts.bs)} ·{" "}
                      {formatUsdt(anomaly.transaction.amounts.usdt)}
                    </p>
                    <p>
                      <span className="text-white/40">FX rate:</span>{" "}
                      {anomaly.transaction.amounts.fxRate.toFixed(3)}
                    </p>
                    <p>
                      <span className="text-white/40">Tx date:</span>{" "}
                      {shortDate(anomaly.transaction.createdAt)}
                    </p>
                    <p>
                      <span className="text-white/40">Detected:</span>{" "}
                      {shortDate(anomaly.detection.detectedAt)}
                    </p>
                  </div>
                  <p className="break-all text-white/40 text-xs">
                    tx {anomaly.transaction.transactionId} · quote{" "}
                    {anomaly.transaction.quoteId}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 lg:flex-col lg:items-stretch">
                  <Button
                    className="border-white/12 bg-white/[0.06] text-white hover:bg-white/10"
                    disabled={isPending}
                    onClick={() => dismiss(anomaly)}
                    type="button"
                    variant="outline"
                  >
                    <XCircle />
                    {isPending ? "Dismissing…" : "Dismiss"}
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
