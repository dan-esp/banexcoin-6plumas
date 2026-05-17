"use client";

import {
  AlertTriangle,
  ArrowRight,
  Brain,
  CalendarRange,
  CheckCheck,
  CheckCircle2,
  FileSpreadsheet,
  LoaderCircle,
  RotateCcw,
  Upload,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { createBatchAction } from "../actions/create-batch";
import type { BatchProcessResult } from "../actions/upload.types";
import type { PublicBatchDto } from "../data";
import {
  brandGradient,
  consoleMutedText,
  consoleSoftSurface,
  consoleSurface,
  formatCount,
  formatOracleRate,
} from "../lib";
import { AppShell } from "./app-shell";

// ── Constants ─────────────────────────────────────────────────────────────────

const DEFAULT_TIERS = [
  { name: "Nivel 1", minBob: 100, maxBob: 1000, rate: 0.01 },
  { name: "Nivel 2", minBob: 1000, maxBob: 5000, rate: 0.015 },
  { name: "Nivel 3", minBob: 5000, maxBob: 999999999, rate: 0.02 },
] as const;

const REQUIRED_COLUMNS = [
  "Transaction ID",
  "User/account ID",
  "User/account name",
  "Amount Bs",
  "Amount USDT",
  "Exchange rate",
  "Transaction date",
  "Status",
  "Service type",
] as const;

const PROCESSING_STEPS = [
  "Subiendo archivo al servidor",
  "Extrayendo y mapeando filas del archivo",
  "Ejecutando pipeline de cashback",
  "Analizando anomalías con IA",
  "Guardando lote en base de datos",
] as const;

// Milliseconds at which each step becomes "active"
const STEP_TIMINGS = [0, 900, 2500, 5000, 8500] as const;

const MAX_FILE_MB = 25;

// Steps shown in the post-upload workflow strip.
// Index 0 = Cargar, 1 = Calcular (current after upload), 2 = Resumen (next).
const BATCH_FLOW_STEPS = [
  "Cargar",
  "Calcular",
  "Resumen",
  "Revisión",
  "Aprobar",
  "Exportar",
] as const;

const COMPLETED_STEP = 1; // 0-indexed: we just finished "Calcular"
const NEXT_STEP = 2;      // "Resumen" is the immediate next action

// Minimal PublicBatchDto stub — just enough to unlock the AppShell sidebar nav.
function buildBatchStub(result: BatchProcessResult): PublicBatchDto {
  return {
    id: result.batchId,
    period: { year: 0, month: 0, label: result.batchName },
    status: "Calculated",
    validation: {
      status: "ok",
      validRows: null,
      warningRows: result.warnings.length,
      blockedRows: result.errors.length,
      exportBlocked: result.errors.length > 0,
    },
    totals: {
      users: result.totalUsersAnalyzed,
      transactions: null,
      consumptionBs: null,
      consumptionUsdt: null,
      cashbackBs: null,
      cashbackUsdt: 0,
    },
    payoutOracle: {
      rate: result.oracle.rate,
      source: result.oracle.source,
      fetchedAt: result.calculatedAt,
      mode: result.oracle.mode,
      status: null,
      reason: result.oracle.fallbackReason ?? null,
    },
    approval: { approved: false, approvedBy: null, approvedAt: null },
    export: { ready: false, exportedAt: null },
    createdAt: result.calculatedAt,
  };
}

// ── Types ─────────────────────────────────────────────────────────────────────

type Phase = "idle" | "uploading" | "error" | "success";

interface UploadError {
  message: string;
  details?: string[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatBatchName(periodMonth: string) {
  if (!periodMonth) return "";
  const [year, month] = periodMonth.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return new Intl.DateTimeFormat("es-BO", {
    month: "long",
    year: "numeric",
  }).format(date);
}

// ── Processing steps view ─────────────────────────────────────────────────────

function ProcessingView({ batchName }: { batchName: string }) {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timers = STEP_TIMINGS.map((delay, i) =>
      setTimeout(() => setActiveStep(i), delay),
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <Card className={cn(consoleSurface, "rounded-[2rem]")}>
      <CardContent className="flex flex-col items-center gap-10 py-14">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="relative">
            <LoaderCircle className="size-14 animate-spin text-[var(--banex-action)] opacity-20" />
            <LoaderCircle className="absolute inset-0 size-14 animate-spin text-[var(--banex-action)] [animation-duration:1.2s]" style={{ clipPath: "inset(0 50% 0 0)" }} />
          </div>
          <h2 className="font-bold text-2xl text-foreground">
            Procesando "{batchName}"
          </h2>
          <p className={cn("max-w-xs text-sm", consoleMutedText)}>
            Esto puede tardar hasta 60 segundos para archivos grandes.
            No cierres esta pestaña.
          </p>
        </div>

        <ol className="w-full max-w-sm space-y-3">
          {PROCESSING_STEPS.map((label, i) => {
            const done = i < activeStep;
            const active = i === activeStep;
            return (
              <li className="flex items-center gap-3" key={label}>
                <span
                  className={cn(
                    "grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold transition-all duration-300",
                    done
                      ? "bg-[var(--success)] text-white"
                      : active
                        ? "bg-[var(--banex-action)] text-white shadow-md shadow-[var(--banex-action)]/30"
                        : "bg-muted text-muted-foreground",
                  )}
                >
                  {done ? (
                    <CheckCircle2 className="size-4" />
                  ) : active ? (
                    <LoaderCircle className="size-3.5 animate-spin" />
                  ) : (
                    i + 1
                  )}
                </span>
                <span
                  className={cn(
                    "text-sm transition-colors duration-300",
                    done
                      ? "text-[var(--success)] line-through"
                      : active
                        ? "font-semibold text-foreground"
                        : consoleMutedText,
                  )}
                >
                  {label}
                  {active ? "…" : ""}
                </span>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}

// ── Workflow progression strip ────────────────────────────────────────────────

function FlowStepper() {
  return (
    <div className={cn("rounded-[2rem] border px-6 py-5", consoleSurface)}>
      <p
        className={cn(
          "mb-4 text-xs font-semibold uppercase tracking-widest",
          consoleMutedText,
        )}
      >
        Progreso del lote
      </p>
      <div className="flex items-center">
        {BATCH_FLOW_STEPS.map((label, i) => {
          const done = i <= COMPLETED_STEP;
          const isNext = i === NEXT_STEP;
          const isLast = i === BATCH_FLOW_STEPS.length - 1;

          return (
            <Fragment key={label}>
              <div className="flex min-w-0 flex-col items-center gap-1.5">
                <span
                  className={cn(
                    "grid size-8 place-items-center rounded-full text-xs font-bold transition-all",
                    done
                      ? cn("text-white", brandGradient)
                      : isNext
                        ? "animate-pulse border-2 border-[var(--banex-action)] text-[var(--banex-action)]"
                        : "bg-muted text-muted-foreground",
                  )}
                >
                  {done ? <CheckCircle2 className="size-4" /> : i + 1}
                </span>
                <span
                  className={cn(
                    "hidden text-center text-xs font-medium sm:block",
                    done
                      ? "text-foreground"
                      : isNext
                        ? "font-semibold text-[var(--banex-action)]"
                        : consoleMutedText,
                  )}
                >
                  {label}
                </span>
              </div>
              {!isLast && (
                <div
                  className={cn(
                    "mx-1 h-0.5 flex-1 transition-colors",
                    i < COMPLETED_STEP
                      ? "bg-[var(--banex-action)]"
                      : "bg-muted",
                  )}
                />
              )}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}

// ── Success result view ───────────────────────────────────────────────────────

function SuccessView({
  result,
  onReset,
}: {
  result: BatchProcessResult;
  onReset: () => void;
}) {
  const router = useRouter();
  const [showAllWarnings, setShowAllWarnings] = useState(false);
  const visibleWarnings = showAllWarnings
    ? result.warnings
    : result.warnings.slice(0, 5);

  return (
    <div className="grid gap-5">
      {/* ── Workflow progression ── */}
      <FlowStepper />

      {/* ── Next-step hero card ── */}
      <div
        className={cn(
          "rounded-[2rem] border p-6",
          consoleSurface,
        )}
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-[var(--success)]/15 text-[var(--success)]">
              <CheckCircle2 className="size-6" />
            </span>
            <div>
              <p
                className={cn(
                  "text-xs font-semibold uppercase tracking-widest",
                  consoleMutedText,
                )}
              >
                Lote creado exitosamente
              </p>
              <h2 className="font-bold text-2xl text-foreground">
                {result.batchName}
              </h2>
              <p className={cn("mt-0.5 font-mono text-xs", consoleMutedText)}>
                {new Date(result.calculatedAt).toLocaleString("es-BO")} · ID:{" "}
                {result.batchId.slice(0, 8)}…
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              className={cn("px-6 text-white", brandGradient)}
              onClick={() => router.push(`/batches/${result.batchId}`)}
              size="lg"
            >
              Ir al Resumen
              <ArrowRight className="size-4" />
            </Button>
            <Button onClick={onReset} size="lg" variant="outline">
              <RotateCcw className="size-4" />
              Nuevo lote
            </Button>
          </div>
        </div>
        <p className={cn("mt-4 text-sm", consoleMutedText)}>
          El siguiente paso es el{" "}
          <span className="font-semibold text-foreground">Resumen</span> — revisa
          las validaciones, cálculos de cashback y el estado de las
          transacciones antes de enviarlo a revisión.
        </p>
      </div>

      {/* ── Oracle bar ── */}
      <div
        className={cn(
          "flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border px-5 py-3 text-sm",
          consoleSoftSurface,
        )}
      >
        <span className={cn("font-medium", consoleMutedText)}>
          Tipo de cambio usado:
        </span>
        <span className="font-bold text-foreground">
          {formatOracleRate(result.oracle.rate)}
        </span>
        <span className={cn("font-mono text-xs", consoleMutedText)}>
          · {result.oracle.source} · {result.oracle.mode}
        </span>
        {result.oracle.usedFallback && (
          <span className="ml-auto flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400">
            <AlertTriangle className="size-3" />
            Fallback
            {result.oracle.fallbackReason
              ? ` · ${result.oracle.fallbackReason}`
              : ""}
          </span>
        )}
      </div>

      {/* ── KPI grid ── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {(
          [
            {
              label: "Usuarios analizados",
              value: formatCount(result.totalUsersAnalyzed),
              tone: "neutral" as const,
            },
            {
              label: "Elegibles para cashback",
              value: formatCount(result.usersQualifyingForCashback),
              tone: "success" as const,
            },
            {
              label: "No elegibles",
              value: formatCount(result.usersNotQualifying),
              tone: "neutral" as const,
            },
            ...(!result.anomalies.skipped
              ? [
                  {
                    label: "Anomalías detectadas",
                    value: formatCount(result.anomalies.anomalies),
                    tone: (result.anomalies.anomalies > 0
                      ? "warning"
                      : "success") as "warning" | "success",
                  },
                ]
              : []),
          ]
        ).map(({ label, value, tone }) => (
          <div
            className={cn(
              "rounded-2xl border px-5 py-4",
              tone === "success" &&
                "border-[var(--success)]/20 bg-[var(--success)]/5",
              tone === "warning" && "border-amber-400/25 bg-amber-500/5",
              tone === "neutral" && consoleSoftSurface,
            )}
            key={label}
          >
            <p
              className={cn(
                "text-xs font-medium uppercase tracking-wider",
                consoleMutedText,
              )}
            >
              {label}
            </p>
            <p className="mt-1 font-bold text-2xl text-foreground">{value}</p>
          </div>
        ))}
      </div>

      {/* ── Audit trail ── */}
      <div className={cn("rounded-2xl border px-5 py-4 text-sm", consoleSoftSurface)}>
        <p
          className={cn(
            "mb-2 text-xs font-semibold uppercase tracking-wider",
            consoleMutedText,
          )}
        >
          Trazabilidad del pipeline
        </p>
        <p className={consoleMutedText}>
          <span className="font-semibold text-foreground">
            {formatCount(result.audit.totalRowsFromStore)}
          </span>{" "}
          filas cargadas →{" "}
          <span className="font-semibold text-foreground">
            {formatCount(result.audit.rowsAfterTripleFilter)}
          </span>{" "}
          después del triple filtro (Completado + Venta + BOB) →{" "}
          <span className="font-semibold text-foreground">
            {formatCount(result.audit.rowsProcessed)}
          </span>{" "}
          procesadas (
          <span className="font-semibold text-foreground">
            {formatCount(result.audit.duplicatesDropped)}
          </span>{" "}
          duplicados eliminados)
          {result.audit.manualReviewTransactions > 0 && (
            <>
              {" · "}
              <span className="font-semibold text-amber-600 dark:text-amber-400">
                {formatCount(result.audit.manualReviewTransactions)}
              </span>{" "}
              transacciones en revisión manual
            </>
          )}
        </p>
      </div>

      {/* ── Pipeline errors ── */}
      {result.errors.length > 0 && (
        <div className="rounded-2xl border border-[var(--blocked-red)]/30 bg-[var(--blocked-red)]/8 p-5">
          <p className="flex items-center gap-2 font-semibold text-foreground">
            <AlertTriangle className="size-4 text-[var(--blocked-red)]" />
            Errores del pipeline ({result.errors.length})
          </p>
          <p className={cn("mt-1 text-xs", consoleMutedText)}>
            El lote fue guardado pero contiene errores. Revisa el archivo fuente.
          </p>
          <ul className="mt-3 space-y-1">
            {result.errors.map((e, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: static list
              <li className={cn("font-mono text-xs", consoleMutedText)} key={i}>
                · {e}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Warnings ── */}
      {result.warnings.length > 0 && (
        <div className={cn("rounded-2xl border p-5", consoleSurface)}>
          <div className="mb-3 flex items-center justify-between">
            <p className="flex items-center gap-2 font-semibold text-foreground">
              <AlertTriangle className="size-4 text-amber-500" />
              Advertencias ({result.warnings.length})
            </p>
            {result.warnings.length > 5 && (
              <button
                className={cn("text-xs underline", consoleMutedText)}
                onClick={() => setShowAllWarnings((v) => !v)}
                type="button"
              >
                {showAllWarnings
                  ? "Mostrar menos"
                  : `Ver todas (${result.warnings.length})`}
              </button>
            )}
          </div>
          <ul className="space-y-1.5">
            {visibleWarnings.map((w, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: static list
              <li className={cn("font-mono text-xs", consoleMutedText)} key={i}>
                {w}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── AI anomaly summary — only when scoring actually ran ── */}
      {!result.anomalies.skipped && (
        <div
          className={cn(
            "flex items-start gap-3 rounded-2xl border px-5 py-4 text-sm",
            consoleSoftSurface,
          )}
        >
          <Brain className="mt-0.5 size-4 shrink-0 text-[var(--banex-action)]" />
          <p className={consoleMutedText}>
            <span className="font-semibold text-foreground">
              {formatCount(result.anomalies.scored)} transacciones
            </span>{" "}
            analizadas con IsolationForest ·{" "}
            <span
              className={cn(
                "font-semibold",
                result.anomalies.anomalies > 0
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-[var(--success)]",
              )}
            >
              {result.anomalies.anomalies === 0
                ? "sin anomalías detectadas"
                : `${formatCount(result.anomalies.anomalies)} anomalías detectadas`}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}

// ── Inline error panel ────────────────────────────────────────────────────────

function ErrorPanel({ error }: { error: UploadError }) {
  return (
    <div className="rounded-2xl border border-[var(--blocked-red)]/30 bg-[var(--blocked-red)]/8 p-5">
      <p className="flex items-center gap-2 font-semibold text-foreground">
        <AlertTriangle className="size-4 text-[var(--blocked-red)]" />
        No se pudo procesar el lote
      </p>
      <p className={cn("mt-2 text-sm", consoleMutedText)}>{error.message}</p>
      {error.details && error.details.length > 0 && (
        <ul className="mt-3 space-y-1">
          {error.details.map((d, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static list
            <li className={cn("font-mono text-xs", consoleMutedText)} key={i}>
              · {d}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export function BatchUploadClient() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [periodMonth, setPeriodMonth] = useState("2026-05");
  const [minimumBob, setMinimumBob] = useState("100");
  const [outputFxRate, setOutputFxRate] = useState("");
  const [manualReviewThreshold, setManualReviewThreshold] = useState("5000");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<UploadError | null>(null);
  const [result, setResult] = useState<BatchProcessResult | null>(null);

  const batchName = useMemo(() => formatBatchName(periodMonth), [periodMonth]);

  function handleFileSelection(file: File | null) {
    if (!file) return;
    setError(null);

    if (!/\.(xlsx|csv)$/i.test(file.name)) {
      setError({
        message: "Formato no soportado. Selecciona un archivo .xlsx o .csv.",
      });
      setPhase("error");
      return;
    }

    const sizeMb = file.size / (1024 * 1024);
    if (sizeMb > MAX_FILE_MB) {
      setError({
        message: `El archivo pesa ${sizeMb.toFixed(1)} MB — el límite es ${MAX_FILE_MB} MB. Reduce el tamaño del archivo antes de continuar.`,
      });
      setPhase("error");
      return;
    }

    setSelectedFile(file);
    setPhase("idle");
  }

  async function handleSubmit() {
    if (!selectedFile || !periodMonth) return;

    setPhase("uploading");
    setError(null);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("batchName", batchName);
    formData.append("tiers", JSON.stringify(DEFAULT_TIERS));
    formData.append("minimumBob", minimumBob);
    if (outputFxRate.trim()) formData.append("outputFxRate", outputFxRate.trim());
    if (manualReviewThreshold.trim())
      formData.append("manualReviewThreshold", manualReviewThreshold.trim());

    const response = await createBatchAction(formData);

    if (response.status === "error") {
      setError({ message: response.message, details: response.details });
      setPhase("error");
      return;
    }

    setResult(response.result);
    setPhase("success");
  }

  function handleReset() {
    setPhase("idle");
    setError(null);
    setResult(null);
    setSelectedFile(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  // ── Uploading — full-screen step view ──
  if (phase === "uploading") {
    return (
      <AppShell>
        <ProcessingView batchName={batchName} />
      </AppShell>
    );
  }

  // ── Success — inline results + unlocked sidebar nav ──
  if (phase === "success" && result) {
    return (
      <AppShell batch={buildBatchStub(result)}>
        <SuccessView onReset={handleReset} result={result} />
      </AppShell>
    );
  }

  // ── Idle / Error — upload form ──
  return (
    <AppShell>
      {/* Page title */}
      <section className="grid gap-4">
        <div>
          <h1 className="font-bold text-3xl text-foreground">
            Cargar lote mensual
          </h1>
          <p className={cn("mt-2 max-w-3xl text-sm", consoleMutedText)}>
            Sube el reporte manual de pagos QR para crear el primer lote
            operativo. Este es el punto de entrada real al flujo de validación,
            cálculo y exportación.
          </p>
        </div>
      </section>

      {/* Upload card + config sidebar */}
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_332px]">
        <Card className={cn(consoleSurface, "rounded-[2rem]")}>
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl">Nuevo lote mensual</CardTitle>
            <p className={cn("max-w-2xl text-sm leading-6", consoleMutedText)}>
              Sube el archivo exportado manualmente desde Banexcoin. La
              plataforma trabaja solo con archivos y no depende de sistemas
              externos para iniciar el proceso.
            </p>
          </CardHeader>
          <CardContent className="grid gap-6">
            {/* Drop zone */}
            <button
              className={cn(
                "grid min-h-52 place-items-center rounded-[1.4rem] border border-dashed px-6 py-8 text-center transition-colors",
                isDragOver
                  ? "border-[var(--banex-action)] bg-[var(--banex-mint)]"
                  : selectedFile
                    ? "border-[var(--success)]/50 bg-[var(--success)]/5"
                    : "border-[var(--banex-action)]/60 bg-[color-mix(in_oklab,var(--banex-mint)_55%,white)]",
              )}
              onClick={() => inputRef.current?.click()}
              onDragEnter={() => setIsDragOver(true)}
              onDragLeave={() => setIsDragOver(false)}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                handleFileSelection(e.dataTransfer.files.item(0));
              }}
              type="button"
            >
              <div className="space-y-3">
                <div
                  className={cn(
                    "mx-auto grid size-14 place-items-center rounded-full shadow-sm",
                    selectedFile
                      ? "bg-[var(--success)]/15 text-[var(--success)]"
                      : "bg-white text-[var(--banex-action)]",
                  )}
                >
                  {selectedFile ? (
                    <CheckCircle2 className="size-7" />
                  ) : (
                    <FileSpreadsheet className="size-7" />
                  )}
                </div>

                {selectedFile ? (
                  <>
                    <p className="font-bold text-xl text-[var(--success)]">
                      Archivo listo
                    </p>
                    <p className="font-semibold text-foreground">
                      {selectedFile.name}
                    </p>
                    <p className={cn("text-xs", consoleMutedText)}>
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB ·{" "}
                      <span className="underline">Cambiar archivo</span>
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-bold text-3xl text-[var(--banex-action)]">
                      XLSX
                    </p>
                    <p className="font-semibold text-lg text-foreground">
                      Suelta aquí el Excel/CSV o elige un archivo
                    </p>
                    <p className={cn("text-sm", consoleMutedText)}>
                      Soportado: .xlsx, .csv. Máximo {MAX_FILE_MB} MB.
                    </p>
                  </>
                )}
              </div>
            </button>

            <input
              accept=".xlsx,.csv"
              className="hidden"
              onChange={(e) =>
                handleFileSelection(e.currentTarget.files?.item(0) ?? null)
              }
              ref={inputRef}
              type="file"
            />

            {/* Config inputs */}
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2" htmlFor="period-month">
                <span className={cn("font-medium text-sm", consoleMutedText)}>
                  Mes del lote
                </span>
                <Input
                  id="period-month"
                  onChange={(e) => setPeriodMonth(e.currentTarget.value)}
                  type="month"
                  value={periodMonth}
                />
              </label>

              <label className="grid gap-2" htmlFor="minimum-bob">
                <span className={cn("font-medium text-sm", consoleMutedText)}>
                  Mínimo mensual en Bs
                </span>
                <Input
                  id="minimum-bob"
                  onChange={(e) => setMinimumBob(e.currentTarget.value)}
                  type="number"
                  value={minimumBob}
                />
              </label>

              <label className="grid gap-2" htmlFor="output-fx-rate">
                <span className={cn("font-medium text-sm", consoleMutedText)}>
                  Tipo de cambio de salida
                </span>
                <Input
                  id="output-fx-rate"
                  onChange={(e) => setOutputFxRate(e.currentTarget.value)}
                  placeholder="Opcional — usa oráculo por defecto"
                  type="number"
                  value={outputFxRate}
                />
              </label>

              <label className="grid gap-2" htmlFor="manual-review-threshold">
                <span className={cn("font-medium text-sm", consoleMutedText)}>
                  Umbral revisión manual (Bs)
                </span>
                <Input
                  id="manual-review-threshold"
                  onChange={(e) =>
                    setManualReviewThreshold(e.currentTarget.value)
                  }
                  type="number"
                  value={manualReviewThreshold}
                />
              </label>
            </div>

            {/* Error feedback */}
            {phase === "error" && error ? <ErrorPanel error={error} /> : null}

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <Button
                className={cn("px-5 text-white", brandGradient)}
                disabled={!selectedFile || !periodMonth}
                onClick={() => void handleSubmit()}
                size="lg"
              >
                <Upload className="size-4" />
                Crear lote
              </Button>
              <Button
                onClick={() => inputRef.current?.click()}
                size="lg"
                variant="outline"
              >
                Elegir archivo
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar: config summary */}
        <Card className={cn(consoleSurface, "rounded-[2rem]")}>
          <CardHeader>
            <CardTitle className="text-xl">Configuración del lote</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {(
              [
                { label: "Periodo", value: periodMonth || "Selecciona un mes" },
                { label: "Fuente", value: "Carga manual" },
                { label: "Activo de payout", value: "USDT" },
                { label: "Estado inicial", value: "calculated" },
              ] as const
            ).map(({ label, value }) => (
              <div className="grid gap-2" key={label}>
                <span
                  className={cn(
                    "font-medium text-xs uppercase tracking-[0.18em]",
                    consoleMutedText,
                  )}
                >
                  {label}
                </span>
                <div
                  className={cn(
                    "rounded-xl border px-4 py-3 text-sm",
                    consoleSoftSurface,
                  )}
                >
                  {value}
                </div>
              </div>
            ))}
            <div className="rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-soft)] p-4">
              <div className="flex items-center gap-2">
                <CalendarRange className="size-4 text-[var(--banex-action)]" />
                <p className="font-semibold text-sm text-foreground">
                  Nombre generado
                </p>
              </div>
              <p className="mt-2 font-bold text-lg text-foreground">
                {batchName || "Pendiente"}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Required columns reference */}
      <Card className={cn(consoleSurface, "rounded-[2rem]")}>
        <CardHeader>
          <CardTitle className="text-2xl">
            Columnas requeridas antes del parsing
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {REQUIRED_COLUMNS.map((column) => (
            <div className="flex items-center gap-3" key={column}>
              <span className="grid size-6 place-items-center rounded-full bg-[var(--banex-mint)] text-[var(--banex-action)]">
                <CheckCheck className="size-3.5" />
              </span>
              <span className="text-sm text-foreground">{column}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </AppShell>
  );
}
