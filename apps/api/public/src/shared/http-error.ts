export type ErrorCode =
  | "bad_request"
  | "not_found"
  | "internal_error"

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: ErrorCode,
    message: string,
  ) {
    super(message)
  }
}

export function badRequest(message: string) {
  return new HttpError(400, "bad_request", message)
}

export function notFound(message: string) {
  return new HttpError(404, "not_found", message)
}
