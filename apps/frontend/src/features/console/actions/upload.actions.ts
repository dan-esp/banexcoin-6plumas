"use server";

import { auth } from "@clerk/nextjs/server";

import type {
  BatchProcessResult,
  ProcessActionState,
  ProcessingReportDto,
  ValidationActionState,
} from "./upload.types";

const DEFAULT_TIERS_ARRAY = [
  { name: "Nivel 1", minBob: 500, maxBob: 1500, rate: 0.01 },
  { name: "Nivel 2", minBob: 1500, maxBob: 5000, rate: 0.015 },
  { name: "Nivel 3", minBob: 5000, maxBob: 999999999, rate: 0.02 },
];

const DEFAULT_TIERS = JSON.stringify(DEFAULT_TIERS_ARRAY);

function getPrivateApiBaseUrl(): string {
  const raw =
    process.env.PRIVATE_API_URL ??
    (process.env.NODE_ENV === "production" ? "" : "http://127.0.0.1:4000");
  if (!raw.trim()) {
    throw new Error(
      "PRIVATE_API_URL is not set. Add it to apps/frontend/.env or .env.local (Next.js does not load the repo root .env).",
    );
  }
  return raw.replace(/\/$/, "");
}

function describeFetchFailure(err: unknown, url: string): string {
  if (err instanceof TypeError && err.message === "fetch failed") {
    const cause = (err as Error & { cause?: unknown }).cause;
    if (cause && typeof cause === "object" && "code" in cause) {
      const code = String((cause as { code: string }).code);
      if (code === "ECONNREFUSED") {
        return `Cannot reach private API at ${url} (connection refused). Run \`pnpm dev:private\` and set PRIVATE_API_URL in apps/frontend/.env to match (e.g. http://127.0.0.1:4000).`;
      }
      if (code === "ENOTFOUND") {
        return `Cannot resolve host in ${url}. Check PRIVATE_API_URL in apps/frontend/.env.`;
      }
      return `Request to ${url} failed (${code}).`;
    }
    return `Cannot reach private API at ${url}. Is the Nest app running? Set PRIVATE_API_URL in apps/frontend/.env (try http://127.0.0.1:4000 if localhost fails).`;
  }
  return err instanceof Error ? err.message : "Unexpected error";
}

async function getBearerToken(): Promise<string> {
  const { getToken } = await auth();
  const token = await getToken();
  if (!token)
    throw new Error("No Clerk session token — user must be signed in");
  return token;
}

async function extractErrorMessage(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { message?: string | string[] };
    if (Array.isArray(body.message)) return body.message.join("; ");
    return body.message ?? `HTTP ${res.status}`;
  } catch {
    return `HTTP ${res.status}`;
  }
}

// ─── validateFileAction ────────────────────────────────────────────────────────
// Two-step: upload file into ETL store, then run processing/calculate preview.

export async function validateFileAction(
  _prevState: ValidationActionState,
  formData: FormData,
): Promise<ValidationActionState> {
  let endpoint = "http://127.0.0.1:4000/api/v1/etl/upload/qr-payments";
  try {
    const base = getPrivateApiBaseUrl();
    const uploadEndpoint = `${base}/api/v1/etl/upload/qr-payments`;
    const calcEndpoint = `${base}/api/v1/processing/calculate`;
    endpoint = uploadEndpoint;

    const token = await getBearerToken();

    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return { status: "error", error: "No file provided." };
    }

    // Step 1: load file into the ETL in-memory store
    const uploadBody = new FormData();
    uploadBody.append("file", file);

    const uploadRes = await fetch(uploadEndpoint, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: uploadBody,
    });

    if (!uploadRes.ok) {
      const message = await extractErrorMessage(uploadRes);
      return { status: "error", error: `ETL upload failed: ${message}` };
    }

    // Step 2: run the processing pipeline with default config to preview results
    endpoint = calcEndpoint;
    const calcRes = await fetch(calcEndpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        period: "Preview",
        minimumBob: 500,
        tiers: DEFAULT_TIERS_ARRAY,
      }),
    });

    if (!calcRes.ok) {
      const message = await extractErrorMessage(calcRes);
      return { status: "error", error: `Processing preview failed: ${message}` };
    }

    const report = (await calcRes.json()) as ProcessingReportDto;
    return { status: "success", report };
  } catch (err) {
    return {
      status: "error",
      error: describeFetchFailure(err, endpoint),
    };
  }
}

// ─── processBatchAction ────────────────────────────────────────────────────────

export async function processBatchAction(
  _prevState: ProcessActionState,
  formData: FormData,
): Promise<ProcessActionState> {
  let endpoint = "http://127.0.0.1:4000/api/v1/batches/process";
  try {
    const base = getPrivateApiBaseUrl();
    endpoint = `${base}/api/v1/batches/process`;

    const token = await getBearerToken();

    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return { status: "error", error: "No file provided." };
    }

    const batchName = (formData.get("batchName") as string | null)?.trim();
    if (!batchName) {
      return { status: "error", error: "Batch name is required." };
    }

    const minimumBobRaw = formData.get("minimumBob") as string | null;
    const minimumBob = parseFloat(minimumBobRaw ?? "");
    if (Number.isNaN(minimumBob) || minimumBob < 0) {
      return {
        status: "error",
        error: "Minimum BOB must be a non-negative number.",
      };
    }

    const tiersRaw = (formData.get("tiers") as string | null) ?? DEFAULT_TIERS;
    try {
      JSON.parse(tiersRaw);
    } catch {
      return { status: "error", error: "Tiers must be valid JSON." };
    }

    const body = new FormData();
    body.append("file", file);
    body.append("batchName", batchName);
    body.append("tiers", tiersRaw);
    body.append("minimumBob", String(minimumBob));

    const outputFxRate = formData.get("outputFxRate") as string | null;
    if (outputFxRate) body.append("outputFxRate", outputFxRate);

    const manualReviewThreshold = formData.get("manualReviewThreshold") as
      | string
      | null;
    if (manualReviewThreshold)
      body.append("manualReviewThreshold", manualReviewThreshold);

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body,
    });

    if (!res.ok) {
      const message = await extractErrorMessage(res);
      return { status: "error", error: message };
    }

    const result = (await res.json()) as BatchProcessResult;
    return {
      status: "success",
      batchId: result.batchId,
      period: result.batchName,
      result,
    };
  } catch (err) {
    return {
      status: "error",
      error: describeFetchFailure(err, endpoint),
    };
  }
}
