import {
  brandGradient,
  consoleMutedText,
  consolePageShell,
  consoleStatePanel,
} from "@/features/console/lib";
import { brand } from "@/lib/brand";

export default function Loading() {
  return (
    <main className={consolePageShell}>
      <div className={`${consoleStatePanel} max-w-sm p-6 text-center`}>
        <div className="mx-auto h-1.5 w-24 overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full w-2/3 animate-pulse rounded-full ${brandGradient}`}
          />
        </div>
        <p className="mt-5 font-bold">Loading {brand.consoleTitle}</p>
        <p className={`mt-1 text-sm ${consoleMutedText}`}>
          Preparing QR cashback workflow data.
        </p>
      </div>
    </main>
  );
}
