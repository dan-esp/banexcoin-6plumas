import { auth } from "@clerk/nextjs/server";

import { fixtureBatch, fixtureDisbursements, fixtureResults } from "./fixtures";
import type {
  ConsoleDataState,
  PublicAnomalyDto,
  PublicBatchDto,
  PublicDisbursementDto,
  PublicResultDto,
} from "./types";

async function fetchJson<T>(path: string, token: string): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }

  const response = await fetch(`${baseUrl}${path}`, {
    cache: "no-store",
    headers: {
      authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Public API responded with ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function getConsoleData(): Promise<ConsoleDataState> {
  const { getToken } = await auth();
  const token = await getToken();

  if (!token) {
    return {
      batch: fixtureBatch,
      results: fixtureResults,
      disbursements: fixtureDisbursements,
      anomalies: [],
      source: "fixture",
      notice: {
        tone: "info",
        title: "Sign in to load live data",
        message:
          "You are viewing fixture data because no Clerk session token was available.",
      },
    };
  }

  try {
    const batches = await fetchJson<{ data: PublicBatchDto[] }>(
      "/v1/batches?limit=1",
      token,
    );
    const batch = batches.data.at(0);

    if (!batch) {
      return {
        batch: fixtureBatch,
        results: [],
        disbursements: [],
        anomalies: [],
        source: "api",
        notice: {
          tone: "info",
          title: "No batches yet",
          message:
            "The public API is connected, but no monthly cashback batches have been processed. Upload a report to populate the console.",
        },
      };
    }

    const [results, disbursements, anomalies] = await Promise.all([
      fetchJson<{ data: PublicResultDto[] }>(
        `/v1/batches/${batch.id}/results`,
        token,
      ),
      fetchJson<{ data: PublicDisbursementDto[] }>(
        `/v1/batches/${batch.id}/disbursements`,
        token,
      ),
      fetchJson<{ data: PublicAnomalyDto[] }>(
        `/v1/anomalies?batchId=${batch.id}&status=open&limit=200`,
        token,
      ).catch(() => ({ data: [] as PublicAnomalyDto[] })),
    ]);

    return {
      batch,
      results: results.data,
      disbursements: disbursements.data,
      anomalies: anomalies.data,
      source: "api",
      notice: null,
    };
  } catch (error) {
    return {
      batch: fixtureBatch,
      results: fixtureResults,
      disbursements: fixtureDisbursements,
      anomalies: [],
      source: "fixture",
      notice: {
        tone: "error",
        title: "Public API unavailable",
        message: `${error instanceof Error ? error.message : "Unknown error"}. Rendering stable fixture data so the console remains reviewable.`,
      },
    };
  }
}
