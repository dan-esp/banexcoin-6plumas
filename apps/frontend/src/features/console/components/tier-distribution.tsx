import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const tiers = [
  { label: "Nivel 1", value: 45, className: "bg-[var(--success)]" },
  { label: "Nivel 2", value: 33, className: "bg-[var(--info-blue)]" },
  { label: "Nivel 3", value: 18, className: "bg-[var(--warning-orange)]" },
  { label: "No tier", value: 4, className: "bg-[var(--blocked-red)]" },
];

export function TierDistribution() {
  return (
    <Card className="border-white/10 bg-white/[0.06] text-white" id="tiers">
      <CardHeader>
        <CardTitle className="text-white">Users by tier</CardTitle>
        <CardDescription className="text-white/52">
          Tier rules are shown for review, not calculated in the UI.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {tiers.map((tier) => (
          <div
            className="grid grid-cols-[76px_1fr_42px] items-center gap-4"
            key={tier.label}
          >
            <p className="font-semibold text-sm text-white">{tier.label}</p>
            <Progress value={tier.value} indicatorClassName={tier.className} />
            <p className="text-sm text-white/50">{tier.value}%</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
