import { AlertTriangle, Database, LockKeyhole } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { brandGradient, consoleMutedText, consoleSoftSurface } from "../lib";

export function ErrorState({ message }: { message: string }) {
  return (
    <Card className="border-[var(--warning-orange)]/30 bg-[var(--warning-orange)]/10 p-4 text-foreground">
      <div className="flex gap-3">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-[var(--warning-orange)]" />
        <div>
          <p className="font-bold">API pública no disponible</p>
          <p className={`mt-1 text-sm ${consoleMutedText}`}>
            {message}. El inicio de sesión funciona, pero la consola autenticada
            no pudo cargar sus datos del flujo público.
          </p>
        </div>
      </div>
    </Card>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="grid min-h-40 place-items-center rounded-3xl border border-dashed border-[var(--brand-border)] bg-[var(--brand-soft)] p-6 text-center">
      <div>
        <Database className="mx-auto size-8 text-muted-foreground" />
        <p className="mt-3 font-bold text-foreground">{title}</p>
        <p className={`mt-1 max-w-md text-sm ${consoleMutedText}`}>
          {description}
        </p>
      </div>
    </div>
  );
}

export function LockedActionNotice({
  label = "Acción bloqueada",
  reason,
}: {
  label?: string;
  reason: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-3xl p-4 text-foreground sm:flex-row sm:items-center sm:justify-between",
        consoleSoftSurface,
      )}
    >
      <div className="flex gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-background text-muted-foreground">
          <LockKeyhole className="size-4" />
        </span>
        <div>
          <p className="font-bold">{label}</p>
          <p className={`mt-1 text-sm ${consoleMutedText}`}>{reason}</p>
        </div>
      </div>
      <Button className={cn("text-white", brandGradient)} disabled>
        Bloqueado
      </Button>
    </div>
  );
}
