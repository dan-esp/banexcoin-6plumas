import { AlertTriangle, CheckCircle2 } from "lucide-react";

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

import type { ProcessingReportDto } from "../actions/upload.types";
import type { PublicBatchDto } from "../data";
import { formatCount } from "../lib";
import { KpiCard } from "./kpi-card";

type Props = {
  batch: PublicBatchDto;
  validationReport?: ProcessingReportDto;
};

const fixtureSeverityBadge = (severity: string) =>
  severity === "Blocked" ? "danger" : "warning";

export function ValidationBanner({ batch, validationReport }: Props) {
  if (validationReport) {
    const {
      audit,
      errors,
      warnings,
      usersQualifyingForCashback,
      usersNotQualifying,
      totalUsersAnalyzed,
    } = validationReport;

    const blocked = errors.length > 0;

    return (
      <Card
        className="border-white/10 bg-white/[0.06] text-white"
        id="validation"
      >
        <CardHeader>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <CardTitle className="text-white">Processing preview</CardTitle>
              <CardDescription className="text-white/52">
                {formatCount(totalUsersAnalyzed)} users analyzed —{" "}
                {new Date(validationReport.calculatedAt).toLocaleTimeString()}
              </CardDescription>
            </div>
            {blocked ? (
              <Button variant="destructive">
                <AlertTriangle />
                Review errors
              </Button>
            ) : (
              <div className="flex items-center gap-2 rounded-full border border-[var(--success)]/30 bg-[var(--success)]/10 px-4 py-2 text-sm font-semibold text-white">
                <CheckCircle2 className="size-4 text-[var(--success)]" />
                Ready to process
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* KPI row */}
          <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              label="Rows processed"
              note="After filter + deduplication"
              value={formatCount(audit.rowsProcessed)}
            />
            <KpiCard
              label="Qualifying users"
              note="Above minimum BOB"
              tone="success"
              value={formatCount(usersQualifyingForCashback)}
            />
            <KpiCard
              label="Not qualifying"
              note="Below minimum BOB"
              tone="info"
              value={formatCount(usersNotQualifying)}
            />
            <KpiCard
              label="Manual review"
              note="High-value transactions"
              tone={audit.manualReviewTransactions > 0 ? "warning" : "success"}
              value={formatCount(audit.manualReviewTransactions)}
            />
          </div>

          {/* Audit breakdown */}
          <div className="mb-5 grid gap-2 rounded-2xl border border-white/10 bg-black/14 p-4 text-sm text-white/70">
            <p>
              <span className="font-semibold text-white">
                {formatCount(audit.totalRowsFromStore)}
              </span>{" "}
              raw rows loaded →{" "}
              <span className="font-semibold text-white">
                {formatCount(audit.rowsAfterTripleFilter)}
              </span>{" "}
              after triple filter (Completed + Sell + BOB) →{" "}
              <span className="font-semibold text-white">
                {formatCount(audit.rowsProcessed)}
              </span>{" "}
              after deduplication (
              {formatCount(audit.duplicatesDropped)} duplicates dropped)
            </p>
          </div>

          {/* Pipeline errors */}
          {blocked && (
            <div className="mb-5 rounded-3xl border border-[var(--blocked-red)]/30 bg-[var(--blocked-red)]/10 p-4">
              <p className="font-bold text-white">Pipeline errors found</p>
              <p className="mt-1 text-sm text-white/55">
                Resolve these issues in the source file before saving the batch.
              </p>
              <ul className="mt-3 space-y-1">
                {errors.map((e, i) => (
                  <li className="font-mono text-xs text-white/70" key={i}>
                    {e}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Warnings table */}
          {warnings.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow className="border-white/10">
                  <TableHead>#</TableHead>
                  <TableHead>Warning</TableHead>
                  <TableHead>Severity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {warnings.slice(0, 20).map((w, i) => (
                  <TableRow className="border-white/10" key={i}>
                    <TableCell className="font-semibold text-white">
                      {i + 1}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-white/70">
                      {w}
                    </TableCell>
                    <TableCell>
                      <Badge tone="warning">WARNING</Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {warnings.length > 20 && (
                  <TableRow className="border-white/10">
                    <TableCell
                      className="text-center text-white/40 text-xs"
                      colSpan={3}
                    >
                      + {warnings.length - 20} more warnings
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    );
  }

  // ── Fixture fallback (no upload yet) ──────────────────────────────────────────
  const fixtureIssues = [
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
            {fixtureIssues.map(([row, tx, user, issue, severity]) => (
              <TableRow className="border-white/10" key={tx}>
                <TableCell className="font-semibold text-white">
                  {row}
                </TableCell>
                <TableCell>{tx}</TableCell>
                <TableCell>{user}</TableCell>
                <TableCell>{issue}</TableCell>
                <TableCell>
                  <Badge tone={fixtureSeverityBadge(severity)}>
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
