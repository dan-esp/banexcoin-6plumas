"use client";

import {
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet,
  Loader2,
  Upload,
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
  ProcessActionState,
  ProcessingReportDto,
  ValidationActionState,
} from "../actions/upload.types";
import type { PublicBatchDto } from "../data";
import { brandGradient } from "../lib";

const ACCEPTED_EXTENSIONS = [".csv", ".xlsx"];
const MAX_FILE_SIZE_MB = 50;

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

type UploadPanelProps = {
  batch: PublicBatchDto;
  onValidated: (report: ProcessingReportDto) => void;
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

  // useTransition lets us call the server action directly with a manually
  // constructed FormData, ensuring the File object is always included.
  const [isValidating, startValidateTransition] = useTransition();
  const [validateState, setValidateState] =
    useState<ValidationActionState>(idleValidation);

  const [processState, processAction, isProcessing] = useActionState(
    processBatchAction,
    idleProcess,
  );

  // File is ready to process once the preview calculation succeeds.
  const ready = validationReport != null;
  const processDone = processState.status === "success";

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setClientError(null);
    if (!file) {
      setSelectedFile(null);
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
  }

  function handleChooseFile() {
    fileInputRef.current?.click();
  }

  function handleValidateSubmit() {
    if (!selectedFile) {
      setClientError("Please select a file first.");
      return;
    }
    // Build FormData from React state so the File is always present on the server.
    const fd = new FormData();
    fd.append("file", selectedFile);
    startValidateTransition(async () => {
      const result = await validateFileAction(idleValidation, fd);
      setValidateState(result);
      if (result.status === "success" && result.report) {
        onValidated(result.report);
      }
    });
  }

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
              <FileSpreadsheet className="size-10 text-[var(--warning-orange)]" />
              {selectedFile ? (
                <>
                  <p className="mt-4 font-bold text-lg text-white">
                    {selectedFile.name}
                  </p>
                  <p className="mt-2 text-sm text-white/52">
                    {(selectedFile.size / 1024).toFixed(0)} KB — click to change
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
                <Upload />
                Choose file
              </Button>
              <Button
                className="border-white/12 bg-white/[0.06] text-white hover:bg-white/10"
                disabled={!selectedFile || isValidating || processDone}
                type="button"
                variant="outline"
                onClick={handleValidateSubmit}
              >
                {isValidating ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <CheckCircle2 />
                )}
                {isValidating ? "Calculating preview…" : "Validate & preview"}
              </Button>
            </div>
          </div>

          {/* Step 2 — Batch config + process (only when preview succeeded) */}
          {ready && !processDone && (
            <form action={processAction} className="grid gap-4">
              {/* Re-inject the file via DataTransfer so processAction receives it */}
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

          {/* Success state */}
          {processDone && (
            <div className="rounded-2xl border border-[var(--success)]/30 bg-[var(--success)]/10 px-5 py-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="size-6 text-[var(--success)]" />
                <p className="font-bold text-white">Batch saved successfully</p>
              </div>
              <p className="mt-2 text-sm text-white/60">
                Period:{" "}
                <span className="font-semibold text-white">
                  {processState.period}
                </span>
              </p>
              <p className="mt-1 font-mono text-sm text-white/40">
                {processState.batchId}
              </p>
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
