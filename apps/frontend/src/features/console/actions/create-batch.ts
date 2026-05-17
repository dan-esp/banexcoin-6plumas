"use server";

import { auth } from "@clerk/nextjs/server";

type CreateBatchResult =
  | { status: "success"; batchId: string }
  | { status: "error"; message: string };

export async function createBatchAction(
  formData: FormData,
): Promise<CreateBatchResult> {
  const privateApiUrl = process.env.PRIVATE_API_URL;

  if (!privateApiUrl) {
    return {
      status: "error",
      message: "PRIVATE_API_URL is not configured",
    };
  }

  const { getToken } = await auth();
  const token = await getToken();

  if (!token) {
    return {
      status: "error",
      message: "Clerk session token is required for Private API requests",
    };
  }

  try {
    const response = await fetch(
      new URL("/api/v1/batches/process", privateApiUrl),
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
        signal: AbortSignal.timeout(30_000),
      },
    );

    if (!response.ok) {
      const message = await response.text();
      return {
        status: "error",
        message: message || `Private API responded with ${response.status}`,
      };
    }

    const payload = (await response.json()) as { batchId?: string };

    if (!payload.batchId) {
      return {
        status: "error",
        message: "La API privada no devolvió el identificador del lote.",
      };
    }

    return {
      status: "success",
      batchId: payload.batchId,
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error ? error.message : "No se pudo crear el lote.",
    };
  }
}
