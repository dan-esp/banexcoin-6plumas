"use client";

import { useAuth } from "@clerk/nextjs";
import { useCallback } from "react";

const defaultTimeoutMs = 8000;

function useAuthorizedFetcher(
  baseUrl: string | undefined,
  serviceLabel: string,
) {
  const { getToken } = useAuth();

  return useCallback(
    async (path: string, init: RequestInit & { timeoutMs?: number } = {}) => {
      if (!baseUrl) {
        throw new Error(`${serviceLabel} URL is not configured`);
      }

      const token = await getToken();
      if (!token) {
        throw new Error("Clerk session token is required for API requests");
      }

      const headers = new Headers(init.headers);

      headers.set("Authorization", `Bearer ${token}`);

      const controller = new AbortController();
      const timeoutMs = init.timeoutMs ?? defaultTimeoutMs;
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        return await fetch(new URL(path, baseUrl), {
          ...init,
          headers,
          signal: controller.signal,
        });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          throw new Error(
            `${serviceLabel} request timed out after ${timeoutMs}ms`,
          );
        }

        throw error;
      } finally {
        clearTimeout(timeoutId);
      }
    },
    [baseUrl, getToken, serviceLabel],
  );
}

export function useApiClient() {
  return useAuthorizedFetcher(process.env.NEXT_PUBLIC_API_URL, "Public API");
}
