"use server";

import { auth } from "@clerk/nextjs/server";

import type { BatchProcessResult } from "./upload.types";

export type CreateBatchResult =
  | { status: "success"; batchId: string; result: BatchProcessResult }
  | { status: "error"; message: string; details?: string[] };

export async function createBatchAction(
  formData: FormData,
): Promise<CreateBatchResult> {
  const privateApiUrl = process.env.PRIVATE_API_URL;

  if (!privateApiUrl) {
    return {
      status: "error",
      message:
        "PRIVATE_API_URL no está configurado. Verifica el archivo .env del servidor.",
    };
  }

  const { getToken } = await auth();
  const token = await getToken();

  if (!token) {
    return {
      status: "error",
      message:
        "Tu sesión ha expirado. Recarga la página e intenta de nuevo.",
    };
  }

  try {
    const response = await fetch(
      new URL("/api/v1/batches/process", privateApiUrl),
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
        signal: AbortSignal.timeout(60_000),
      },
    );

    if (!response.ok) {
      let message = `Error del servidor (${response.status})`;
      let details: string[] | undefined;

      try {
        const body = (await response.json()) as {
          message?: string | string[];
          error?: string;
        };
        if (Array.isArray(body.message)) {
          message = body.message[0] ?? message;
          details =
            body.message.length > 1 ? body.message.slice(1) : undefined;
        } else if (typeof body.message === "string") {
          message = body.message;
        }
      } catch {
        const text = await response.text().catch(() => "");
        if (text) message = text.slice(0, 400);
      }

      return { status: "error", message, details };
    }

    const payload = (await response.json()) as BatchProcessResult;

    if (!payload.batchId) {
      return {
        status: "error",
        message: "La API privada no devolvió el identificador del lote.",
      };
    }

    return { status: "success", batchId: payload.batchId, result: payload };
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "TimeoutError") {
        return {
          status: "error",
          message:
            "El procesamiento tardó más de 60 s. Intenta con un archivo más pequeño o verifica la conexión al servidor.",
        };
      }
      if (
        error.message.includes("fetch failed") ||
        error.message.includes("ECONNREFUSED") ||
        error.message.includes("ENOTFOUND")
      ) {
        return {
          status: "error",
          message:
            "No se pudo conectar con el servidor. Verifica que la API privada esté activa en el puerto configurado.",
        };
      }
      return { status: "error", message: error.message };
    }
    return { status: "error", message: "No se pudo crear el lote." };
  }
}
