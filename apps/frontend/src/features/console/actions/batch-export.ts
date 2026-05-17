"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

type BatchCommandResult =
  | { status: "success"; message?: string }
  | { status: "error"; message: string };

async function callPrivateBatchCommand(
  batchId: string,
  path: string,
): Promise<BatchCommandResult> {
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
    const response = await fetch(new URL(path, privateApiUrl), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) {
      const message = await response.text();
      return {
        status: "error",
        message: message || `Private API responded with ${response.status}`,
      };
    }

    revalidatePath(`/batches/${batchId}`);
    revalidatePath(`/batches/${batchId}/export`);

    return { status: "success" };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "No se pudo completar la acción.",
    };
  }
}

export async function approveBatchAction(
  batchId: string,
): Promise<BatchCommandResult> {
  return callPrivateBatchCommand(batchId, `/api/v1/batches/${batchId}/approve`);
}

export async function prepareBanexTransferExportAction(
  batchId: string,
): Promise<BatchCommandResult> {
  return callPrivateBatchCommand(batchId, `/api/v1/batches/${batchId}/export`);
}
