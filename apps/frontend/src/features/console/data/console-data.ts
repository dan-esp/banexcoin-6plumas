import { fixtureBatch, fixtureDisbursements, fixtureResults } from "./fixtures";
import type {
  ConsoleDataState,
  PublicBatchDto,
  PublicDisbursementDto,
  PublicResultDto,
} from "./types";

async function fetchJson<T>(path: string): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }

  const response = await fetch(`${baseUrl}${path}`, {
    next: { revalidate: 30 },
  });

  if (!response.ok) {
    throw new Error(`Public API responded with ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function getConsoleData(): Promise<ConsoleDataState> {
  try {
    const batches = await fetchJson<{ data: PublicBatchDto[] }>(
      "/v1/batches?limit=1",
    );
    const batch = batches.data.at(0);

    if (!batch) {
      return {
        batch: fixtureBatch,
        results: [],
        disbursements: [],
        source: "api",
        error: "No monthly batches were returned by the public API.",
      };
    }

    const [results, disbursements] = await Promise.all([
      fetchJson<{ data: PublicResultDto[] }>(`/v1/batches/${batch.id}/results`),
      fetchJson<{ data: PublicDisbursementDto[] }>(
        `/v1/batches/${batch.id}/disbursements`,
      ),
    ]);

    return {
      batch,
      results: results.data,
      disbursements: disbursements.data,
      source: "api",
      error: null,
    };
  } catch (error) {
    return {
      batch: fixtureBatch,
      results: fixtureResults,
      disbursements: fixtureDisbursements,
      source: "fixture",
      error: error instanceof Error ? error.message : "Public API unavailable",
    };
  }
}
