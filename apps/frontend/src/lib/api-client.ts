"use client";

import { useAuth } from "@clerk/nextjs";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

export function useApiClient() {
  const { getToken } = useAuth();

  return async function apiFetch(path: string, init: RequestInit = {}) {
    if (!apiBaseUrl) {
      throw new Error("NEXT_PUBLIC_API_URL is not configured");
    }

    const token = await getToken();
    if (!token) {
      throw new Error("Clerk session token is required for API requests");
    }

    const headers = new Headers(init.headers);

    headers.set("Authorization", `Bearer ${token}`);

    return fetch(new URL(path, apiBaseUrl), {
      ...init,
      headers,
    });
  };
}
