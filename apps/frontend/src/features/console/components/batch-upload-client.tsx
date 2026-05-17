"use client";

import {
  CalendarRange,
  CheckCheck,
  FileSpreadsheet,
  LoaderCircle,
  Upload,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { createBatchAction } from "../actions/create-batch";
import {
  brandGradient,
  consoleMutedText,
  consoleSoftSurface,
  consoleSurface,
} from "../lib";
import { AppShell } from "./app-shell";

const DEFAULT_TIERS = [
  { name: "Nivel 1", minBob: 100, maxBob: 999.99, rate: 0.01 },
  { name: "Nivel 2", minBob: 1000, maxBob: 4999.99, rate: 0.015 },
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

type UploadState =
  | { status: "idle" }
  | { status: "uploading" }
  | { status: "error"; message: string };

function formatBatchName(periodMonth: string) {
  if (!periodMonth) {
    return "";
  }

  const [year, month] = periodMonth.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);

  return new Intl.DateTimeFormat("es-BO", {
    month: "long",
    year: "numeric",
  }).format(date);
}

export function BatchUploadClient() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();
  const [periodMonth, setPeriodMonth] = useState("2026-05");
  const [minimumBob, setMinimumBob] = useState("100");
  const [outputFxRate, setOutputFxRate] = useState("");
  const [manualReviewThreshold, setManualReviewThreshold] = useState("5000");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>({
    status: "idle",
  });

  const batchName = useMemo(() => formatBatchName(periodMonth), [periodMonth]);

  function handleFileSelection(file: File | null) {
    if (!file) {
      return;
    }

    if (!/\.(xlsx|csv)$/i.test(file.name)) {
      setUploadState({
        status: "error",
        message: "Selecciona un archivo .xlsx o .csv válido.",
      });
      return;
    }

    setSelectedFile(file);
    setUploadState({ status: "idle" });
  }

  async function handleSubmit() {
    if (!selectedFile || !periodMonth) {
      return;
    }

    setUploadState({ status: "uploading" });

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("batchName", batchName);
    formData.append("tiers", JSON.stringify(DEFAULT_TIERS));
    formData.append("minimumBob", minimumBob);

    if (outputFxRate.trim()) {
      formData.append("outputFxRate", outputFxRate.trim());
    }

    if (manualReviewThreshold.trim()) {
      formData.append("manualReviewThreshold", manualReviewThreshold.trim());
    }

    try {
      const result = await createBatchAction(formData);

      if (result.status === "error") {
        throw new Error(result.message);
      }

      router.push(`/batches/${result.batchId}`);
      router.refresh();
    } catch (error) {
      setUploadState({
        status: "error",
        message:
          error instanceof Error ? error.message : "No se pudo crear el lote.",
      });
    }
  }

  return (
    <AppShell>
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
            <button
              className={cn(
                "grid min-h-52 place-items-center rounded-[1.4rem] border border-dashed px-6 py-8 text-center transition-colors",
                isDragOver
                  ? "border-[var(--banex-action)] bg-[var(--banex-mint)]"
                  : "border-[var(--banex-action)]/60 bg-[color-mix(in_oklab,var(--banex-mint)_55%,white)]",
              )}
              onClick={() => inputRef.current?.click()}
              onDragEnter={() => setIsDragOver(true)}
              onDragLeave={() => setIsDragOver(false)}
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragOver(true);
              }}
              onDrop={(event) => {
                event.preventDefault();
                setIsDragOver(false);
                handleFileSelection(event.dataTransfer.files.item(0));
              }}
              type="button"
            >
              <div className="space-y-3">
                <div className="mx-auto grid size-14 place-items-center rounded-full bg-white text-[var(--banex-action)] shadow-sm">
                  <FileSpreadsheet className="size-7" />
                </div>
                <p className="font-bold text-3xl text-[var(--banex-action)]">
                  XLSX
                </p>
                <p className="font-semibold text-lg text-foreground">
                  Suelta aquí el Excel/CSV o elige un archivo
                </p>
                <p className={cn("text-sm", consoleMutedText)}>
                  Soportado: .xlsx, .csv. Máximo 25 MB.
                </p>
                {selectedFile ? (
                  <p className="font-medium text-sm text-foreground">
                    Archivo seleccionado: {selectedFile.name}
                  </p>
                ) : null}
              </div>
            </button>

            <input
              accept=".xlsx,.csv"
              className="hidden"
              onChange={(event) =>
                handleFileSelection(event.currentTarget.files?.item(0) ?? null)
              }
              ref={inputRef}
              type="file"
            />

            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2" htmlFor="period-month">
                <span className={cn("font-medium text-sm", consoleMutedText)}>
                  Mes del lote
                </span>
                <Input
                  id="period-month"
                  onChange={(event) =>
                    setPeriodMonth(event.currentTarget.value)
                  }
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
                  onChange={(event) => setMinimumBob(event.currentTarget.value)}
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
                  onChange={(event) =>
                    setOutputFxRate(event.currentTarget.value)
                  }
                  placeholder="Opcional"
                  type="number"
                  value={outputFxRate}
                />
              </label>

              <label className="grid gap-2" htmlFor="manual-review-threshold">
                <span className={cn("font-medium text-sm", consoleMutedText)}>
                  Umbral revisión manual
                </span>
                <Input
                  id="manual-review-threshold"
                  onChange={(event) =>
                    setManualReviewThreshold(event.currentTarget.value)
                  }
                  type="number"
                  value={manualReviewThreshold}
                />
              </label>
            </div>

            {uploadState.status === "error" ? (
              <div className="rounded-2xl border border-[var(--blocked-red)]/25 bg-[var(--blocked-red)]/8 px-4 py-3 text-sm text-foreground">
                {uploadState.message}
              </div>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <Button
                className={cn("px-5 text-white", brandGradient)}
                disabled={
                  !selectedFile ||
                  !periodMonth ||
                  uploadState.status === "uploading"
                }
                onClick={() => void handleSubmit()}
                size="lg"
              >
                {uploadState.status === "uploading" ? (
                  <>
                    <LoaderCircle className="size-4 animate-spin" />
                    Procesando lote
                  </>
                ) : (
                  <>
                    <Upload className="size-4" />
                    Crear lote
                  </>
                )}
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

        <Card className={cn(consoleSurface, "rounded-[2rem]")}>
          <CardHeader>
            <CardTitle className="text-xl">Configuración del lote</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <span
                className={cn(
                  "font-medium text-xs uppercase tracking-[0.18em]",
                  consoleMutedText,
                )}
              >
                Periodo
              </span>
              <div
                className={cn(
                  "rounded-xl border px-4 py-3 text-sm",
                  consoleSoftSurface,
                )}
              >
                {periodMonth || "Selecciona un mes"}
              </div>
            </div>
            <div className="grid gap-2">
              <span
                className={cn(
                  "font-medium text-xs uppercase tracking-[0.18em]",
                  consoleMutedText,
                )}
              >
                Fuente
              </span>
              <div
                className={cn(
                  "rounded-xl border px-4 py-3 text-sm",
                  consoleSoftSurface,
                )}
              >
                Carga manual
              </div>
            </div>
            <div className="grid gap-2">
              <span
                className={cn(
                  "font-medium text-xs uppercase tracking-[0.18em]",
                  consoleMutedText,
                )}
              >
                Activo de payout
              </span>
              <div
                className={cn(
                  "rounded-xl border px-4 py-3 text-sm",
                  consoleSoftSurface,
                )}
              >
                USDT
              </div>
            </div>
            <div className="grid gap-2">
              <span
                className={cn(
                  "font-medium text-xs uppercase tracking-[0.18em]",
                  consoleMutedText,
                )}
              >
                Estado inicial
              </span>
              <div
                className={cn(
                  "rounded-xl border px-4 py-3 text-sm",
                  consoleSoftSurface,
                )}
              >
                Uploaded
              </div>
            </div>
            <div className="rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-soft)] p-4">
              <div className="flex items-center gap-2">
                <CalendarRange className="size-4 text-[var(--banex-action)]" />
                <p className="font-semibold text-sm text-foreground">
                  Nombre generado
                </p>
              </div>
              <p className="mt-2 text-lg font-bold text-foreground">
                {batchName || "Pendiente"}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

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
