import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

import type { PublicBatchDto } from "../data";
import {
  brandGradient,
  consoleMutedText,
  consoleSurface,
  getCurrentWorkflowIndex,
  workflowSteps,
} from "../lib";

export function WorkflowStepper({ batch }: { batch: PublicBatchDto }) {
  const currentIndex = getCurrentWorkflowIndex(batch.status);

  return (
    <Card className={consoleSurface}>
      <CardHeader>
        <CardTitle>Progreso del lote mensual</CardTitle>
        <CardDescription>
          Bloqueo actual: {batch.validation.blockedRows} filas de transacción
          necesitan corrección antes de aprobar la exportación para
          BanexTransfer.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
          {workflowSteps.map((step, index) => {
            const done = index <= currentIndex;

            return (
              <div
                className="flex min-w-0 flex-col items-center gap-2"
                key={step}
              >
                <div
                  className={cn(
                    "flex size-9 items-center justify-center rounded-full border font-bold text-xs",
                    done
                      ? cn("border-transparent text-white", brandGradient)
                      : "border-[var(--brand-border)] bg-[var(--brand-soft)] text-muted-foreground",
                  )}
                >
                  {index + 1}
                </div>
                <p
                  className={cn(
                    "text-center font-semibold text-xs leading-4",
                    done ? "text-foreground" : consoleMutedText,
                  )}
                >
                  {step}
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
