import { Download, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

import type { PublicBatchDto, PublicResultDto } from "../data";
import { brandGradient, formatOracleRate, formatUsdt } from "../lib";
import { ResultsTable } from "./results-table";

export function CalculationReview({
  batch,
  results,
}: {
  batch: PublicBatchDto;
  results: PublicResultDto[];
}) {
  const canApprove =
    batch.validation.blockedRows === 0 && !batch.approval.approved;

  return (
    <Card
      className="border-white/10 bg-white/[0.06] text-white"
      id="calculations"
    >
      <CardHeader>
        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <CardTitle className="text-white">Calculation review</CardTitle>
            <CardDescription className="text-white/52">
              Finance reviews USDT liability, oracle rate, tier lock, and
              warnings before approval.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge tone="warning">Warnings included</Badge>
            <Button
              className={cn(canApprove && brandGradient)}
              disabled={!canApprove}
            >
              <ShieldCheck />
              Approve batch
            </Button>
            <Button
              className="border-white/12 bg-white/[0.06] text-white hover:bg-white/10"
              disabled={!batch.export.ready}
              variant="outline"
            >
              <Download />
              Export draft
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-[var(--warning-orange)]/30 bg-[var(--warning-orange)]/10 p-4">
            <p className="font-semibold text-white/45 text-xs">Payout oracle</p>
            <p className="mt-2 font-bold text-xl">
              {formatOracleRate(batch.payoutOracle.rate)}
            </p>
            <p className="mt-1 text-white/48 text-xs">
              {batch.payoutOracle.source ?? "Oracle source pending"}
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-black/14 p-4">
            <p className="font-semibold text-white/45 text-xs">
              Cashback liability
            </p>
            <p className="mt-2 font-bold text-xl">
              {formatUsdt(batch.totals.cashbackUsdt)}
            </p>
            <p className="mt-1 text-white/48 text-xs">
              Locked for finance review only
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-black/14 p-4">
            <p className="font-semibold text-white/45 text-xs">Export gate</p>
            <p className="mt-2 font-bold text-xl">
              {batch.export.ready ? "Ready" : "Locked"}
            </p>
            <p className="mt-1 text-white/48 text-xs">
              Approval and blocked-row clearance required
            </p>
          </div>
        </div>
        <ResultsTable results={results} />
        <div className="mt-5 rounded-3xl border border-white/10 bg-black/14 p-4">
          <p className="font-bold text-white">Formula trace</p>
          <p className="mt-2 text-sm text-white/52">
            cashbackUsdt = cashbackBs / locked payout oracle rate. Historical
            effective rates are displayed for audit only and never replace the
            payout oracle.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
