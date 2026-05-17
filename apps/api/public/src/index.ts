import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { HTTPException } from 'hono/http-exception'
import { Scalar } from '@scalar/hono-api-reference'
import { accountRoutes } from './accounts/routes'
import { anomalyRoutes } from './anomalies/routes'
import { getAuth, requireAuth } from './auth/clerk'
import { batchRoutes } from './batches/routes'
import { prisma } from './db/client'
import { healthRoutes } from './health/routes'
import { legacyRoutes } from './legacy/routes'
import { openApiDocument } from './openapi'
import { HttpError } from './shared/http-error'

const app = new Hono()

function parseList(value: string | undefined): string[] | undefined {
  const parsed = value
    ?.split(',')
    .map((item) => item.trim())
    .filter(Boolean)

  return parsed?.length ? parsed : undefined
}

const allowedOrigins = parseList(process.env.CORS_ORIGIN) ?? ['http://localhost:3000']

app.use(
  '*',
  cors({
    origin: (origin) => {
      if (!origin) return undefined
      return allowedOrigins.includes(origin) ? origin : undefined
    },
    allowHeaders: ['Authorization', 'Content-Type'],
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    maxAge: 86400,
  })
)

app.route('/health', healthRoutes)
app.get('/openapi.json', (c) => c.json(openApiDocument))
app.get(
  '/docs',
  Scalar({
    pageTitle: 'BanexReintegra Public API Docs',
    url: '/openapi.json',
  }),
)

app.get('/', (c) =>
  c.json({
    service: 'banexcoin-public-api',
    status: 'ok',
    role: 'read-gateway',
    version: 'v1',
    links: {
      health: '/health',
      batches: '/v1/batches',
      anomalies: '/v1/anomalies',
    },
  })
)

app.use('*', requireAuth)

app.get('/auth/session', (c) => {
  const auth = getAuth(c)
  return c.json({ userId: auth?.userId, sessionId: auth?.sessionId })
})

app.route('/v1/batches', batchRoutes)
app.route('/v1/accounts', accountRoutes)
app.route('/v1/anomalies', anomalyRoutes)
app.route('/', legacyRoutes)

app.notFound((c) =>
  c.json({ error: { code: 'not_found', message: 'route not found' } }, 404)
)

app.onError((error, c) => {
  if (error instanceof HttpError) {
    return c.json(
      { error: { code: error.code, message: error.message } },
      error.status
    )
  }

  if (error instanceof HTTPException) {
    return c.json(
      { error: { code: 'bad_request', message: error.message } },
      error.status
    )
  }

  console.error(error)
  return c.json(
    { error: { code: 'internal_error', message: 'unexpected public api error' } },
    500
  )
})

process.on('SIGTERM', () => prisma.$disconnect())
process.on('SIGINT', () => prisma.$disconnect())

const port = Number(process.env.PORT ?? 5000)

export default {
  port,
  fetch: app.fetch,
}
