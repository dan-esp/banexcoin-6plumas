"use client";

import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Upload,
  Zap,
} from "lucide-react";
import { useActionState, useRef, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import {
  processBatchAction,
  validateFileAction,
} from "../actions/upload.actions";
import type {
  BatchProcessResult,
  ProcessActionState,
  ProcessingReportDto,
  ValidationActionState,
} from "../actions/upload.types";
import type { PublicBatchDto } from "../data";
import { brandGradient, formatBs, formatCount, formatOracleRate, formatUsdt } from "../lib";

const ACCEPTED_EXTENSIONS = [".csv", ".xlsx"];
const MAX_FILE_SIZE_MB = 50;
const RESULTS_PREVIEW_LIMIT = 8;

const DEFAULT_TIERS = JSON.stringify(
  [
    { name: "Nivel 1", minBob: 500, maxBob: 1500, rate: 0.01 },
    { name: "Nivel 2", minBob: 1500, maxBob: 5000, rate: 0.015 },
    { name: "Nivel 3", minBob: 5000, maxBob: 999999999, rate: 0.02 },
  ],
  null,
  2,
);

const expectedColumns = [
  "Transaccion Id",
  "Numero de Cuenta",
  "Creado por",
  "Monto Pagado",
  "Monto intercambio",
  "Precio",
  "Fecha de creacion",
  "Estado",
  "Tipo de servicio",
];

const idleValidation: ValidationActionState = { status: "idle" };
const idleProcess: ProcessActionState = { status: "idle" };

function clientValidateFile(file: File): string | null {
  const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  if (!ACCEPTED_EXTENSIONS.includes(ext)) {
    return `Invalid file type "${ext}". Only .csv and .xlsx are accepted.`;
  }
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    return `File is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum is ${MAX_FILE_SIZE_MB} MB.`;
  }
  return null;
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatPill({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string | number;
  tone?: "neutral" | "success" | "warning" | "danger";
}) {
  const toneClass = {
    neutral: "border-white/10 bg-white/[0.06]",
    success: "border-[var(--success)]/20 bg-[var(--success)]/10",
    warning: "border-[var(--warning-orange)]/20 bg-[var(--warning-orange)]/10",
    danger: "border-[var(--blocked-red)]/20 bg-[var(--blocked-red)]/10",
  }[tone];

  return (
    <div className={cn("rounded-2xl border px-4 py-3", toneClass)}>
      <p className="font-semibold text-white/50 text-xs">{label}</p>
      <p className="mt-1 font-bold text-lg text-white">{value}</p>
    </div>
  );
}

function BatchResultsView({ result }: { result: BatchProcessResult }) {
  const qualifying = result.results
    .filter((r) => r.cashbackUsdt > 0)
    .sort((a, b) => b.cashbackUsdt - a.cashbackUsdt);

  const preview = qualifying.slice(0, RESULTS_PREVIEW_LIMIT);
  const remaining = qualifying.length - preview.length;

  const totalCashbackUsdt = qualifying.reduce(
    (sum, r) => sum + r.cashbackUsdt,
    0,
  );

  const oracleIsLive = result.oracle.mode === "live";

  return (
    <div className="mt-4 grid gap-4">
      {/* ── Oracle context ── */}
      <div
        className={cn(
          "flex flex-wrap items-center gap-3 rounded-2xl border px-4 py-3 text-sm",
          result.oracle.usedFallback
            ? "border-[var(--warning-orange)]/30 bg-[var(--warning-orange)]/10"
            : "border-white/10 bg-white/[0.04]",
        )}
      >
        {oracleIsLive ? (
          <Zap className="size-4 shrink-0 text-[var(--success)]" />
        ) : (
          <ShieldCheck className="size-4 shrink-0 text-[var(--warning-orange)]" />
        )}
        <span className="font-bold text-white">
          {formatOracleRate(result.oracle.rate)}
        </span>
        <span className="text-white/50">·</span>
        <span className="text-white/70">{result.oracle.source}</span>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 font-semibold text-xs",
            oracleIsLive
              ? "bg-[var(--success)]/20 text-[var(--success)]"
              : "bg-[var(--warning-orange)]/20 text-[var(--warning-orange)]",
          )}
        >
          {oracleIsLive ? "live" : "manual"}
        </span>
        {result.oracle.usedFallback && (
          <span className="text-white/50 text-xs">
            (fallback — {result.oracle.fallbackReason})
          </span>
        )}
      </div>

      {/* ── KPI stats ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatPill
          label="Users analyzed"
          value={formatCount(result.totalUsersAnalyzed)}
        />
        <StatPill
          label="Qualifying"
          tone="success"
          value={formatCount(result.usersQualifyingForCashback)}
        />
        <StatPill
          label="Not qualifying"
          value={formatCount(result.usersNotQualifying)}
        />
        <StatPill
          label="Cashback liability"
          tone="success"
          value={formatUsdt(totalCashbackUsdt)}
        />
      </div>

      {/* ── Anomalies pill ── */}
      {!result.anomalies.skipped && result.anomalies.anomalies > 0 && (
        <div className="flex items-center gap-2 rounded-xl border border-[var(--warning-orange)]/30 bg-[var(--warning-orange)]/10 px-4 py-2.5 text-sm text-white">
          <AlertTriangle className="size-4 shrink-0 text-[var(--warning-orange)]" />
          <span>
            <span className="font-bold">{result.anomalies.anomalies}</span>{" "}
            anomalous transaction
            {result.anomalies.anomalies !== 1 ? "s" : ""} flagged out of{" "}
            {result.anomalies.scored} scored — review the AI Anomalies panel.
          </span>
        </div>
      )}

      {/* ── Warnings ── */}
      {result.warnings.length > 0 && (
        <div className="grid gap-1.5">
          {result.warnings.map((w, i) => (
            <div
              className="flex items-start gap-2 rounded-xl border border-[var(--warning-orange)]/20 bg-[var(--warning-orange)]/8 px-3 py-2 text-sm text-white/80"
              // biome-ignore lint/suspicious/noArrayIndexKey: static list
              key={i}
            >
              <AlertCircle className="mt-0.5 size-3.5 shrink-0 text-[var(--warning-orange)]" />
              {w}
            </div>
          ))}
        </div>
      )}

      {/* ── Results table ── */}
      {preview.length > 0 && (
        <div>
          <p className="mb-2 font-semibold text-white/50 text-xs">
            Qualifying users — top {preview.length}
            {remaining > 0 ? ` of ${qualifying.length}` : ""}
          </p>
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-white/10 border-b bg-white/[0.04]">
                  {[
                    "Account",
                    "Username",
                    "Tier",
                    "Total BOB",
                    "Rate",
                    "Cashback USDT",
                    "Txns",
                  ].map((h) => (
                    <th
                      className="px-3 py-2 text-left font-semibold text-white/45 text-xs"
                      key={h}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map((row, i) => (
                  <tr
                    className={cn(
                      "border-white/[0.06] transition-colors hover:bg-white/[0.04]",
                      i < preview.length - 1 && "border-b",
                    )}
                    key={row.accountId}
                  >
                    <td className="px-3 py-2 font-mono text-white/70 text-xs">
                      {row.accountId}
                    </td>
                    <td className="max-w-[140px] truncate px-3 py-2 font-semibold text-white">
                      {row.username}
                    </td>
                    <td className="px-3 py-2">
                      <span className="rounded-full bg-white/[0.08] px-2 py-0.5 font-semibold text-white/70 text-xs">
                        {row.tierName}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-white/80">
                      {formatBs(row.totalBob)}
                    </td>
                    <td className="px-3 py-2 text-white/60">
                      {(row.rate * 100).toFixed(1)}%
                    </td>
                    <td className="px-3 py-2 font-semibold text-[var(--success)]">
                      {formatUsdt(row.cashbackUsdt)}
                    </td>
                    <td className="px-3 py-2 text-white/50">
                      {row.transactionCount}
                      {row.manualReviewTransactions > 0 && (
                        <span className="ml-1 text-[var(--warning-orange)]">
                          ⚑{row.manualReviewTransactions}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {remaining > 0 && (
              <p className="px-3 py-2.5 text-center text-white/40 text-xs">
                +{remaining} more row{remaining !== 1 ? "s" : ""} — available
                in the Export center
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Audit footer ── */}
      <div className="flex flex-wrap gap-4 rounded-xl border border-white/[0.06] bg-black/10 px-4 py-3 text-xs text-white/40">
        <span>
          <span className="font-semibold text-white/60">
            {result.audit.rowsProcessed}
          </span>{" "}
          rows processed
        </span>
        <span>·</span>
        <span>
          <span className="font-semibold text-white/60">
            {result.audit.duplicatesDropped}
          </span>{" "}
          duplicates dropped
        </span>
        <span>·</span>
        <span>
          <span className="font-semibold text-white/60">
            {result.audit.rowsDiscardedByValidation}
          </span>{" "}
          discarded by validation
        </span>
        {result.audit.manualReviewTransactions > 0 && (
          <>
            <span>·</span>
            <span className="text-[var(--warning-orange)]">
              <span className="font-semibold">
                {result.audit.manualReviewTransactions}
              </span>{" "}
              flagged for manual review
            </span>
          </>
        )}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

type UploadPanelProps = {
  batch: PublicBatchDto;
  onValidated: (report: ProcessingReportDto | null) => void;
  validationReport: ProcessingReportDto | null;
};

export function UploadPanel({
  batch,
  onValidated,
  validationReport,
}: UploadPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);

  // Flips to true when a new file is picked; back to false after validation.
  // Prevents processDone / ready from leaking across file selections.
  const [localReset, setLocalReset] = useState(false);

  const [isValidating, startValidateTransition] = useTransition();
  const [validateState, setValidateState] =
    useState<ValidationActionState>(idleValidation);

  const [processState, processAction, isProcessing] = useActionState(
    processBatchAction,
    idleProcess,
  );

  const ready = validationReport != null && !localReset;
  const processDone = processState.status === "success" && !localReset;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setClientError(null);
    setValidateState(idleValidation);

    if (!file) {
      setSelectedFile(null);
      setLocalReset(false);
      onValidated(null);
      return;
    }

    const err = clientValidateFile(file);
    if (err) {
      setClientError(err);
      setSelectedFile(null);
      e.target.value = "";
      return;
    }

    setSelectedFile(file);
    setLocalReset(true);
    onValidated(null);
  }

  function handleChooseFile() {
    fileInputRef.current?.click();
  }

  function handleValidateSubmit() {
    if (!selectedFile) {
      setClientError("Please select a file first.");
      return;
    }
    const fd = new FormData();
    fd.append("file", selectedFile);
    startValidateTransition(async () => {
      const result = await validateFileAction(idleValidation, fd);
      setValidateState(result);
      if (result.status === "success" && result.report) {
        setLocalReset(false);
        onValidated(result.report);
      }
    });
  }

  const isRevalidating =
    validationReport != null && localReset && selectedFile != null;

  return (
    <section
      className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]"
      id="upload"
    >
      {/* ── Main upload card ── */}
      <Card className="border-white/10 bg-white/[0.06] text-white">
        <CardHeader>
          <CardTitle className="text-white">Upload monthly report</CardTitle>
          <CardDescription className="text-white/52">
            Manual workbook intake for Pago QR rows. The private API owns
            parsing, validation, and batch creation.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5">
          {/* Step 1 — File selection + validate */}
          <div>
            <input
              ref={fileInputRef}
              accept=".csv,.xlsx"
              className="hidden"
              type="file"
              onChange={handleFileChange}
            />

            {/* Drop zone */}
            <button
              className="flex min-h-52 w-full cursor-pointer flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-white/16 bg-black/14 p-6 text-center transition-colors hover:border-white/30"
              type="button"
              onClick={handleChooseFile}
            >
              <FileSpreadsheet
                className={cn(
                  "size-10",
                  selectedFile && !localReset
                    ? "text-[var(--success)]"
                    : "text-[var(--warning-orange)]",
                )}
              />
              {selectedFile ? (
                <>
                  <p className="mt-4 font-bold text-lg text-white">
                    {selectedFile.name}
                  </p>
                  <p className="mt-2 text-sm text-white/52">
                    {(selectedFile.size / 1024).toFixed(0)} KB —{" "}
                    {localReset
                      ? "needs validation · click to change"
                      : "validated · click to change"}
                  </p>
                </>
              ) : (
                <>
                  <p className="mt-4 font-bold text-lg text-white">
                    Drop Excel or CSV report here
                  </p>
                  <p className="mt-2 max-w-xl text-sm text-white/52">
                    Expected source: Banexcoin Pago QR workbook for{" "}
                    {batch.period.label}. Accepted: .csv, .xlsx (max 50 MB).
                  </p>
                </>
              )}
            </button>

            {/* Client-side error */}
            {clientError && (
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-[var(--blocked-red)]/30 bg-[var(--blocked-red)]/10 px-4 py-3 text-sm text-white">
                <AlertCircle className="size-4 shrink-0 text-[var(--blocked-red)]" />
                {clientError}
              </div>
            )}

            {/* Server-side validate error */}
            {validateState.status === "error" && (
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-[var(--blocked-red)]/30 bg-[var(--blocked-red)]/10 px-4 py-3 text-sm text-white">
                <AlertCircle className="size-4 shrink-0 text-[var(--blocked-red)]" />
                {validateState.error}
              </div>
            )}

            {/* Re-validate hint */}
            {isRevalidating && (
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-[var(--warning-orange)]/30 bg-[var(--warning-orange)]/10 px-4 py-3 text-sm text-white">
                <RefreshCw className="size-4 shrink-0 text-[var(--warning-orange)]" />
                New file selected — click{" "}
                <span className="mx-1 font-semibold">
                  Re-validate &amp; preview
                </span>{" "}
                to continue.
              </div>
            )}

            {/* Validation passed banner */}
            {ready && (
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-[var(--success)]/30 bg-[var(--success)]/10 px-4 py-3 text-sm text-white">
                <CheckCircle2 className="size-4 shrink-0 text-[var(--success)]" />
                Preview calculated — fill in batch details below to save.
              </div>
            )}

            <div className="mt-5 flex flex-wrap gap-3">
              <Button
                className={cn("text-white", brandGradient)}
                type="button"
                onClick={handleChooseFile}
              >
                {selectedFile ? <RefreshCw /> : <Upload />}
                {selectedFile ? "Change file" : "Choose file"}
              </Button>
              <Button
                className="border-white/12 bg-white/[0.06] text-white hover:bg-white/10"
                disabled={!selectedFile || isValidating}
                type="button"
                variant="outline"
                onClick={handleValidateSubmit}
              >
                {isValidating ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <CheckCircle2 />
                )}
                {isValidating
                  ? "Calculating preview…"
                  : isRevalidating
                    ? "Re-validate & preview"
                    : "Validate & preview"}
              </Button>
            </div>
          </div>

          {/* Step 2 — Batch config + process */}
          {ready && !processDone && (
            <form action={processAction} className="grid gap-4">
              <input
                className="hidden"
                name="file"
                type="file"
                ref={(el) => {
                  if (el && selectedFile) {
                    const dt = new DataTransfer();
                    dt.items.add(selectedFile);
                    el.files = dt.files;
                  }
                }}
              />

              <div className="grid gap-4 rounded-2xl border border-white/10 bg-black/14 p-4 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <label
                    className="font-semibold text-white/60 text-xs"
                    htmlFor="batchName"
                  >
                    Batch name{" "}
                    <span className="text-[var(--blocked-red)]">*</span>
                  </label>
                  <Input
                    required
                    className="border-white/10 bg-white/[0.06] text-white placeholder:text-white/30"
                    defaultValue={batch.period.label}
                    id="batchName"
                    name="batchName"
                    placeholder="e.g. April 2025"
                  />
                </div>

                <div className="grid gap-1.5">
                  <label
                    className="font-semibold text-white/60 text-xs"
                    htmlFor="minimumBob"
                  >
                    Minimum BOB{" "}
                    <span className="text-[var(--blocked-red)]">*</span>
                  </label>
                  <Input
                    required
                    className="border-white/10 bg-white/[0.06] text-white placeholder:text-white/30"
                    defaultValue={500}
                    id="minimumBob"
                    min={0}
                    name="minimumBob"
                    type="number"
                  />
                </div>

                <div className="grid gap-1.5">
                  <label
                    className="font-semibold text-white/60 text-xs"
                    htmlFor="outputFxRate"
                  >
                    FX rate override (BOB/USDT)
                    <span className="ml-1 text-white/40">optional</span>
                  </label>
                  <Input
                    className="border-white/10 bg-white/[0.06] text-white placeholder:text-white/30"
                    id="outputFxRate"
                    min={0.000001}
                    name="outputFxRate"
                    placeholder="Uses oracle if empty"
                    step="any"
                    type="number"
                  />
                </div>

                <div className="grid gap-1.5">
                  <label
                    className="font-semibold text-white/60 text-xs"
                    htmlFor="manualReviewThreshold"
                  >
                    Manual review threshold (BOB)
                    <span className="ml-1 text-white/40">optional</span>
                  </label>
                  <Input
                    className="border-white/10 bg-white/[0.06] text-white placeholder:text-white/30"
                    id="manualReviewThreshold"
                    min={0}
                    name="manualReviewThreshold"
                    placeholder="Default 5000"
                    type="number"
                  />
                </div>

                <div className="grid gap-1.5 sm:col-span-2">
                  <label
                    className="font-semibold text-white/60 text-xs"
                    htmlFor="tiers"
                  >
                    Cashback tiers (JSON)
                  </label>
                  <textarea
                    className="min-h-28 w-full rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 font-mono text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/20"
                    defaultValue={DEFAULT_TIERS}
                    id="tiers"
                    name="tiers"
                    rows={6}
                    spellCheck={false}
                  />
                </div>
              </div>

              {processState.status === "error" && (
                <div className="flex items-center gap-2 rounded-xl border border-[var(--blocked-red)]/30 bg-[var(--blocked-red)]/10 px-4 py-3 text-sm text-white">
                  <AlertCircle className="size-4 shrink-0 text-[var(--blocked-red)]" />
                  {processState.error}
                </div>
              )}

              <Button
                className={cn("w-full text-white sm:w-auto", brandGradient)}
                disabled={isProcessing}
                type="submit"
              >
                {isProcessing ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Upload />
                )}
                {isProcessing ? "Processing batch…" : "Process & save batch"}
              </Button>
            </form>
          )}

          {/* Step 3 — Success + results visualization */}
          {processDone && processState.result && (
            <div className="rounded-2xl border border-[var(--success)]/30 bg-[var(--success)]/10 px-5 py-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="size-6 shrink-0 text-[var(--success)]" />
                  <div>
                    <p className="font-bold text-white">Batch saved</p>
                    <p className="font-mono text-white/40 text-xs">
                      {processState.batchId}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="hidden text-white/50 text-xs sm:inline">
                    {processState.period}
                  </span>
                  <Button
                    className="border-white/12 bg-white/[0.06] text-white/70 hover:bg-white/10 hover:text-white"
                    size="sm"
                    type="button"
                    variant="outline"
                    onClick={handleChooseFile}
                  >
                    <Upload className="size-3.5" />
                    New batch
                  </Button>
                </div>
              </div>

              <BatchResultsView result={processState.result} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Batch details sidebar ── */}
      <Card className="border-white/10 bg-white/[0.06] text-white">
        <CardHeader>
          <CardTitle className="text-white">Batch details</CardTitle>
          <CardDescription className="text-white/52">
            Visible context before any finance action.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {[
            ["Period month", batch.period.label],
            ["Source", "Manual Banexcoin report"],
            ["Currency asset", "USDT payout, BOB QR"],
            [
              "Status after upload",
              processDone ? "Saved → Calculated" : "Uploaded → Validating",
            ],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="font-semibold text-white/45 text-xs">{label}</p>
              <div className="mt-2 rounded-2xl border border-white/10 bg-black/14 px-3 py-2 font-semibold text-sm text-white">
                {value}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ── Pre-import column checklist ── */}
      <Card className="border-white/10 bg-white/[0.06] text-white xl:col-span-2">
        <CardHeader>
          <CardTitle className="text-white">
            Pre-import column checklist
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {expectedColumns.map((check) => (
            <div className="flex items-center gap-3" key={check}>
              <span
                className={cn(
                  "flex size-6 items-center justify-center rounded-full text-white",
                  brandGradient,
                )}
              >
                <CheckCircle2 className="size-4" />
              </span>
              <span className="font-semibold text-sm text-white/78">
                {check}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}
