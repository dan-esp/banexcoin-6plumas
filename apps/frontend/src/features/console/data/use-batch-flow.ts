"use client";

import { useEffect, useState } from "react";

import { useApiClient } from "@/lib/api-client";

import type {
  ConsoleDataState,
  PublicAnomalyDto,
  PublicBatchDto,
  PublicDisbursementDto,
  PublicOracleContextDto,
  PublicResultDto,
  PublicTransactionDto,
} from "./types";

type PublicItemResponse<T> = {
  data: T;
};

type PublicListResponse<T> = {
  data: T[];
};

const LATEST_BATCH_CACHE_KEY = "__latest__";
const batchFlowCache = new Map<string, ConsoleDataState>();

export type BatchFlowState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "empty" }
  | { status: "ready"; data: ConsoleDataState };

function getBatchFlowCacheKey(batchId?: string) {
  return batchId ?? LATEST_BATCH_CACHE_KEY;
}

function getCachedBatchFlowState(batchId?: string): BatchFlowState | null {
  const cached = batchFlowCache.get(getBatchFlowCacheKey(batchId));
  return cached ? { status: "ready", data: cached } : null;
}

function cacheBatchFlow(data: ConsoleDataState) {
  batchFlowCache.set(LATEST_BATCH_CACHE_KEY, data);
  batchFlowCache.set(data.batch.id, data);
}

export function useBatchFlow(batchId?: string) {
  const apiFetch = useApiClient();
  const [state, setState] = useState<BatchFlowState>(
    getCachedBatchFlowState(batchId) ?? { status: "loading" },
  );

  useEffect(() => {
    let cancelled = false;

    async function loadBatchFlow() {
      const cachedState = getCachedBatchFlowState(batchId);

      if (cachedState) {
        setState(cachedState);
        return;
      }

      setState({ status: "loading" });

      try {
        let batch: PublicBatchDto | undefined;

        if (batchId) {
          const batchResponse = await apiFetch(`/v1/batches/${batchId}`);
          if (!batchResponse.ok) {
            throw new Error(
              `Batch request failed with ${batchResponse.status}`,
            );
          }

          const payload =
            (await batchResponse.json()) as PublicItemResponse<PublicBatchDto>;
          batch = payload.data;
        } else {
          const batchesResponse = await apiFetch("/v1/batches?limit=1");
          if (!batchesResponse.ok) {
            throw new Error(
              `Public API responded with ${batchesResponse.status}`,
            );
          }

          const batches =
            (await batchesResponse.json()) as PublicListResponse<PublicBatchDto>;
          batch = batches.data.at(0);
        }

        if (cancelled) {
          return;
        }

        if (!batch) {
          setState({ status: "empty" });
          return;
        }

        const [
          resultsResponse,
          disbursementsResponse,
          transactionsResponse,
          oracleResponse,
          anomaliesResponse,
        ] = await Promise.all([
          apiFetch(`/v1/batches/${batch.id}/results`),
          apiFetch(`/v1/batches/${batch.id}/disbursements`),
          apiFetch(`/v1/batches/${batch.id}/transactions?limit=10`),
          apiFetch(`/v1/oracle/batches/${batch.id}`),
          apiFetch(`/v1/anomalies?batchId=${batch.id}&status=open&limit=200`),
        ]);

        if (!resultsResponse.ok) {
          throw new Error(
            `Batch results request failed with ${resultsResponse.status}`,
          );
        }

        if (!disbursementsResponse.ok) {
          throw new Error(
            `Batch disbursements request failed with ${disbursementsResponse.status}`,
          );
        }

        if (!transactionsResponse.ok) {
          throw new Error(
            `Batch transactions request failed with ${transactionsResponse.status}`,
          );
        }

        if (!oracleResponse.ok) {
          throw new Error(
            `Batch oracle request failed with ${oracleResponse.status}`,
          );
        }

        const results =
          (await resultsResponse.json()) as PublicListResponse<PublicResultDto>;
        const disbursements =
          (await disbursementsResponse.json()) as PublicListResponse<PublicDisbursementDto>;
        const anomalies = anomaliesResponse.ok
          ? ((await anomaliesResponse.json()) as PublicListResponse<PublicAnomalyDto>)
          : { data: [] as PublicAnomalyDto[] };
        const transactions =
          (await transactionsResponse.json()) as PublicListResponse<PublicTransactionDto>;
        const oracle =
          (await oracleResponse.json()) as PublicItemResponse<PublicOracleContextDto>;

        if (cancelled) {
          return;
        }

        const nextState: ConsoleDataState = {
          batch,
          results: results.data,
          disbursements: disbursements.data,
          transactions: transactions.data,
          oracle: oracle.data,
          anomalies: anomalies.data,
          error: null,
        };

        cacheBatchFlow(nextState);

        setState({
          status: "ready",
          data: nextState,
        });
      } catch (error) {
        if (cancelled) {
          return;
        }

        setState({
          status: "error",
          message:
            error instanceof Error ? error.message : "Public API unavailable",
        });
      }
    }

    void loadBatchFlow();

    return () => {
      cancelled = true;
    };
  }, [apiFetch, batchId]);

  return state;
}
