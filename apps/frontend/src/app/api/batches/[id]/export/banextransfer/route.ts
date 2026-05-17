import { auth } from "@clerk/nextjs/server";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const privateApiUrl = process.env.PRIVATE_API_URL;

  if (!privateApiUrl) {
    return new Response("PRIVATE_API_URL is not configured", { status: 500 });
  }

  const { id } = await context.params;
  const { getToken } = await auth();
  const token = await getToken();

  if (!token) {
    return new Response("Clerk session token is required", { status: 401 });
  }

  const response = await fetch(
    new URL(`/api/v1/batches/${id}/export/banextransfer.csv`, privateApiUrl),
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal: AbortSignal.timeout(20_000),
    },
  );

  if (!response.ok) {
    return new Response(await response.text(), { status: response.status });
  }

  const headers = new Headers();
  headers.set(
    "Content-Type",
    response.headers.get("Content-Type") ?? "text/csv",
  );
  headers.set(
    "Content-Disposition",
    response.headers.get("Content-Disposition") ??
      `attachment; filename="banextransfer-${id}.csv"`,
  );

  const checksum = response.headers.get("X-Export-Checksum");
  if (checksum) {
    headers.set("X-Export-Checksum", checksum);
  }

  return new Response(response.body, { headers });
}
