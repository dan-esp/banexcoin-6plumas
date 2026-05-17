import { auth } from "@clerk/nextjs/server";
import {
  ArrowRight,
  CheckCircle2,
  CircleDollarSign,
  FileSpreadsheet,
  Landmark,
  LockKeyhole,
  ShieldCheck,
  TrendingUp,
  UploadCloud,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { BrandLogo } from "@/components/brand/brand-logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";

const CONSOLE_SIGN_IN_URL = "/sign-in";

const datasetStats = [
  {
    label: "Transacciones QR válidas",
    value: "5.325",
  },
  {
    label: "Usuarios únicos",
    value: "239",
  },
  {
    label: "Flags AML",
    value: "12",
  },
  {
    label: "Meses cubiertos",
    value: "4",
  },
];

const pipelineSteps = [
  {
    icon: UploadCloud,
    label: "Upload",
    note: "Workbook mensual",
  },
  {
    icon: ShieldCheck,
    label: "Validate",
    note: "Pago QR + S-001",
  },
  {
    icon: TrendingUp,
    label: "Calculate",
    note: "Cashback por cuenta",
  },
  {
    icon: LockKeyhole,
    label: "Lock FX",
    note: "Tasa USDT/BOB",
  },
  {
    icon: Landmark,
    label: "Approve",
    note: "Finanzas",
  },
  {
    icon: FileSpreadsheet,
    label: "Export",
    note: "BanexTransfer",
  },
];

const proofCards = [
  {
    title: "Datos reales",
    body: "La muestra de referencia cubre May - Ago 2025 con pagos QR suficientes para probar validacion, agregacion y revision.",
  },
  {
    title: "Controles antes del pago",
    body: "Las filas bloqueadas no entran al calculo; el lote aprobado conserva tasa oracle, version de tiers y trazabilidad.",
  },
  {
    title: "Salida operativa",
    body: "El resultado final es un archivo revisable para BanexTransfer, no una ejecucion automatica sin aprobacion.",
  },
];

const reviewMetrics = [
  {
    label: "Validas",
    value: "5.325",
    widthClass: "w-[78%]",
    toneClass: "bg-[var(--banex-action)]",
  },
  {
    label: "Duplicadas",
    value: "1",
    widthClass: "w-[18%]",
    toneClass: "bg-[var(--coin-gold)]",
  },
  {
    label: "AML",
    value: "12",
    widthClass: "w-[34%]",
    toneClass: "bg-[var(--blocked-red)]",
  },
];

const brandGradient =
  "bg-[linear-gradient(135deg,var(--banex-dark)_0%,var(--banex-action)_62%,var(--coin-gold)_100%)]";

const panelClass =
  "border border-[var(--brand-border)] bg-[var(--brand-surface)] shadow-[0_18px_48px_rgba(15,23,42,0.08)] dark:shadow-[0_18px_48px_rgba(0,0,0,0.22)]";

const eyebrowClass =
  "font-mono text-xs font-semibold uppercase text-muted-foreground";

export default async function HomePage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/batches");
  }

  return (
    <main className="min-h-screen bg-[var(--background)] text-foreground">
      <section className="mx-auto flex w-full max-w-[86rem] items-center justify-between gap-4 px-5 py-5 sm:px-7 lg:px-10">
        <BrandLogo />

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            className="inline-flex h-11 items-center justify-center rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] px-4 text-sm font-semibold text-foreground transition hover:bg-[var(--brand-soft)]"
            href={CONSOLE_SIGN_IN_URL}
          >
            Iniciar sesion
          </Link>
        </div>
      </section>

      <section className="relative overflow-hidden border-y border-[var(--brand-border)] bg-[var(--brand-surface)]">
        <div className="absolute inset-0 opacity-[0.08] dark:opacity-[0.12]">
          <div className="h-full w-full bg-[linear-gradient(90deg,var(--brand-border)_1px,transparent_1px),linear-gradient(180deg,var(--brand-border)_1px,transparent_1px)] bg-[size:54px_54px]" />
        </div>

        <div className="relative mx-auto grid min-h-[calc(100svh-5.25rem)] w-full max-w-[86rem] content-center gap-10 px-5 py-12 sm:px-7 lg:px-10">
          <div className="max-w-4xl">
            <p className={`${eyebrowClass} mb-5 text-[var(--banex-action)]`}>
              Acceso interno / Cashback QR
            </p>
            <h1 className="max-w-5xl text-5xl font-bold leading-[1.02] text-foreground sm:text-6xl lg:text-7xl">
              BanexReintegra
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground sm:text-xl">
              Consola para convertir reportes mensuales de Pago QR en lotes de
              cashback validados, aprobados por finanzas y listos para
              BanexTransfer.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                className={`inline-flex h-12 items-center gap-2 rounded-lg px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5 ${brandGradient}`}
                href={CONSOLE_SIGN_IN_URL}
              >
                Iniciar sesion
                <ArrowRight className="size-4" />
              </Link>
              <span className="inline-flex h-12 items-center gap-2 rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] px-5 text-sm font-semibold text-muted-foreground">
                <CircleDollarSign className="size-4 text-[var(--coin-gold)]" />
                USDT payout con FX bloqueado
              </span>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[0.76fr_1.24fr]">
            <div className={`rounded-lg p-5 ${panelClass}`}>
              <p className={eyebrowClass}>Dataset de referencia</p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                {datasetStats.map((stat) => (
                  <div
                    className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-soft)] p-4"
                    key={stat.label}
                  >
                    <p className="text-3xl font-bold text-foreground">
                      {stat.value}
                    </p>
                    <p className="mt-2 text-xs font-medium leading-5 text-muted-foreground">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                May - Ago 2025. Hoja Pago QR, tipo S-001, estado Completed,
                moneda BOB.
              </p>
            </div>

            <div className={`rounded-lg p-5 ${panelClass}`}>
              <div className="flex items-center justify-between gap-4">
                <p className={eyebrowClass}>Vista de lote mensual</p>
                <span className="rounded-md bg-[var(--banex-mint)] px-3 py-1 text-xs font-semibold text-[var(--banex-action)] dark:bg-[rgba(0,110,94,0.22)] dark:text-[#8fe8d1]">
                  Revision
                </span>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-[0.95fr_1.05fr]">
                <div className="space-y-4">
                  {reviewMetrics.map((metric) => (
                    <div key={metric.label}>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-medium text-foreground">
                          {metric.label}
                        </span>
                        <span className="font-mono text-xs text-muted-foreground">
                          {metric.value}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-[var(--brand-soft)]">
                        <div
                          className={`h-full rounded-full ${metric.widthClass} ${metric.toneClass}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-soft)] p-4">
                  <p className="text-sm font-semibold text-foreground">
                    Gate financiero
                  </p>
                  <div className="mt-4 space-y-3">
                    {[
                      "Cashback calculado por cuenta",
                      "Oracle USDT/BOB bloqueado",
                      "Exportacion liberada tras aprobacion",
                    ].map((item) => (
                      <div className="flex items-start gap-2" key={item}>
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[var(--banex-action)]" />
                        <p className="text-sm leading-5 text-muted-foreground">
                          {item}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[86rem] px-5 py-12 sm:px-7 lg:px-10">
        <div className="mb-7 flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <p className={`${eyebrowClass} text-[var(--banex-action)]`}>
              Flujo MVP
            </p>
            <h2 className="mt-3 max-w-3xl text-3xl font-bold leading-tight text-foreground sm:text-4xl">
              Del workbook al archivo BanexTransfer sin perder trazabilidad.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-muted-foreground">
            La landing refleja la documentacion actual: primero validar, luego
            calcular, bloquear FX, aprobar y exportar.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
          {pipelineSteps.map((step, index) => {
            const Icon = step.icon;

            return (
              <article
                className={`rounded-lg p-4 ${panelClass}`}
                key={step.label}
              >
                <div
                  className={`mb-4 grid size-10 place-items-center rounded-lg text-white ${
                    index === pipelineSteps.length - 1
                      ? "bg-[var(--coin-gold)]"
                      : "bg-[var(--banex-action)]"
                  }`}
                >
                  <Icon className="size-5" />
                </div>
                <p className="font-semibold text-foreground">{step.label}</p>
                <p className="mt-2 text-sm leading-5 text-muted-foreground">
                  {step.note}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-[86rem] gap-4 px-5 pb-14 sm:px-7 md:grid-cols-3 lg:px-10 lg:pb-20">
        {proofCards.map((card) => (
          <article className={`rounded-lg p-5 ${panelClass}`} key={card.title}>
            <p className="text-lg font-semibold text-foreground">
              {card.title}
            </p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {card.body}
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}
