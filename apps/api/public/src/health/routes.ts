import { Hono } from "hono"

export const healthRoutes = new Hono()

healthRoutes.get("/", (c) =>
  c.json({
    service: "banexcoin-public-api",
    status: "ok",
    role: "read-gateway",
  }),
)
