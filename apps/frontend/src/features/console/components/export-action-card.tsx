import { CheckCircle2, Download, LockKeyhole } from "lucide-react";

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

import type { PublicBatchDto, PublicDisbursementDto } from "../data";
import { brandGradient } from "../lib";
import { LockedActionNotice } from "./states";

const exportOptions = [
  {
    name: "Detailed Cashback Report",
    format: "XLSX / CSV",
    description: "Review totals, tiers, warnings, and row trace",
    emphasis: false,
  },
  {
    name: "BanexTransfer Payout File",
    format: "CSV",
    description: "One positive USDT cashback row per account",
    emphasis: true,
  },
  {
    name: "Executive Summary",
    format: "PDF / XLSX",
    description: "Management summary with approval context",
    emphasis: false,
  },
];

export function ExportActionCard({
  batch,
  disbursements,
}: {
  batch: PublicBatchDto;
  disbursements: PublicDisbursementDto[];
}) {
  const gates = [
    { label: "Validation clear", done: batch.validation.blockedRows === 0 },
    { label: "Oracle locked", done: Boolean(batch.payoutOracle.rate) },
    { label: "Finance approved", done: batch.approval.approved },
    { label: "Export unlocked", done: batch.export.ready },
  ];
  const firstDisbursement = disbursements.at(0);

  return (
    <Card className="border-white/10 bg-white/[0.06] text-white" id="export">
      <CardHeader>
        <CardTitle className="text-white">Export center</CardTitle>
        <CardDescription className="text-white/52">
          Export actions stay disabled until finance approval is true and
          blocked rows are clear.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5">
        <div className="grid gap-3 md:grid-cols-4">
          {gates.map((gate) => (
            <div className="flex items-center gap-2" key={gate.label}>
              <span
                className={cn(
                  "flex size-7 items-center justify-center rounded-full",
                  gate.done
                    ? cn("text-white", brandGradient)
                    : "bg-white/[0.06] text-white/40",
                )}
              >
                {gate.done ? (
                  <CheckCircle2 className="size-4" />
                ) : (
                  <LockKeyhole className="size-4" />
                )}
              </span>
              <p className="font-semibold text-sm text-white/76">
                {gate.label}
              </p>
            </div>
          ))}
        </div>
        {!batch.export.ready ? (
          <LockedActionNotice reason="Blocked validation rows and finance approval must clear before export generation." />
        ) : null}
        {exportOptions.map((option) => (
          <div
            className="grid gap-4 rounded-3xl border border-white/10 bg-black/14 p-5 lg:grid-cols-[1fr_auto_auto] lg:items-center"
            key={option.name}
          >
            <div>
              <p className="font-bold text-lg text-white">{option.name}</p>
              <p className="mt-1 text-sm text-white/52">{option.description}</p>
            </div>
            <Badge tone={option.emphasis ? "warning" : "neutral"}>
              {option.format}
            </Badge>
            <Button
              className={cn(
                option.emphasis && batch.export.ready && brandGradient,
                !option.emphasis &&
                  "border-white/12 bg-white/[0.06] text-white hover:bg-white/10",
              )}
              disabled={!batch.export.ready}
              variant={option.emphasis ? "default" : "outline"}
            >
              <Download />
              Generate
            </Button>
          </div>
        ))}
        <div className="rounded-3xl border border-white/10 bg-black/24 p-5 text-white">
          <p className="font-bold">Payout CSV sample</p>
          <p className="mt-3 overflow-x-auto whitespace-nowrap font-mono text-[var(--warning-orange)] text-xs">
            reference,account_number,alias,cashback_usdt,status {"->"}{" "}
            {firstDisbursement?.exportReference ?? "BR-202605-000000"},
            {firstDisbursement?.accountNumber ?? "000000"},
            {firstDisbursement?.alias ?? "Pending"},
            {firstDisbursement?.cashbackUsdt ?? "0.00"},draft
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
