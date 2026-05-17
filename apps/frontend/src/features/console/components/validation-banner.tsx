import { AlertTriangle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { PublicBatchDto } from "../data";
import { formatCount } from "../lib";
import { KpiCard } from "./kpi-card";

const validationIssues = [
  [
    "122",
    "TX-90017",
    "Comercio 6 de Agosto",
    "Duplicated transaction id",
    "Blocked",
  ],
  ["309", "TX-90183", "Punto QR Norte", "Monto Pagado is missing", "Blocked"],
  [
    "611",
    "TX-90470",
    "Mercado Central SRL",
    "High value, AI review support",
    "Warning",
  ],
] as const;

export function ValidationBanner({ batch }: { batch: PublicBatchDto }) {
  return (
    <Card
      className="border-white/10 bg-white/[0.06] text-white"
      id="validation"
    >
      <CardHeader>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle className="text-white">Validation results</CardTitle>
            <CardDescription className="text-white/52">
              Validation is shown before payout optimism. Export stays locked
              while blocked rows exist.
            </CardDescription>
          </div>
          <Button variant="destructive">
            <AlertTriangle />
            Review errors
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label="Valid rows"
            note="Eligible Pago QR rows"
            value={formatCount(batch.validation.validRows)}
          />
          <KpiCard
            label="Warnings"
            note="Can continue with review"
            tone="warning"
            value={formatCount(batch.validation.warningRows)}
          />
          <KpiCard
            label="Errors"
            note="Needs operator action"
            tone="danger"
            value="12"
          />
          <KpiCard
            label="Blocked"
            note="Export blocked"
            tone="danger"
            value={formatCount(batch.validation.blockedRows)}
          />
        </div>
        <div className="mb-5 rounded-3xl border border-[var(--blocked-red)]/30 bg-[var(--blocked-red)]/10 p-4">
          <p className="font-bold text-white">Batch validation is blocked</p>
          <p className="mt-1 text-sm text-white/55">
            Resolve duplicated or invalid rows before calculating final
            BanexTransfer export files.
          </p>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="border-white/10">
              <TableHead>Row</TableHead>
              <TableHead>Transaction ID</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Issue</TableHead>
              <TableHead>Severity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {validationIssues.map(([row, tx, user, issue, severity]) => (
              <TableRow className="border-white/10" key={tx}>
                <TableCell className="font-semibold text-white">
                  {row}
                </TableCell>
                <TableCell>{tx}</TableCell>
                <TableCell>{user}</TableCell>
                <TableCell>{issue}</TableCell>
                <TableCell>
                  <Badge tone={severity === "Blocked" ? "danger" : "warning"}>
                    {severity}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
