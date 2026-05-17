import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

import type { PublicBatchDto } from "../data";
import { brandGradient, getCurrentWorkflowIndex, workflowSteps } from "../lib";

export function WorkflowStepper({ batch }: { batch: PublicBatchDto }) {
  const currentIndex = getCurrentWorkflowIndex(batch.status);

  return (
    <Card className="border-white/10 bg-white/[0.06] text-white">
      <CardHeader>
        <CardTitle className="text-white">Monthly batch progress</CardTitle>
        <CardDescription className="text-white/52">
          Current blocker: {batch.validation.blockedRows} transaction rows need
          correction before BanexTransfer payout export can be approved.
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
                      : "border-white/10 bg-white/[0.04] text-white/38",
                  )}
                >
                  {index + 1}
                </div>
                <p
                  className={cn(
                    "text-center font-semibold text-xs leading-4",
                    done ? "text-white" : "text-white/42",
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
