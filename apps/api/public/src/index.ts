import { Hono } from 'hono'
import { prisma } from './db/client'

const app = new Hono()

app.get('/', (c) => c.json({ service: 'banexcoin-public-api', status: 'ok' }))

app.get('/users', async (c) => {
  const users = await prisma.user.findMany({
    select: { account_number: true, alias: true, created_at: true },
  })
  return c.json(users)
})

app.get('/users/:account_number', async (c) => {
  const account_number = Number(c.req.param('account_number'))
  const user = await prisma.user.findUnique({
    where: { account_number },
    select: { account_number: true, alias: true, created_at: true },
  })
  if (!user) return c.json({ error: 'not found' }, 404)
  return c.json(user)
})

app.get('/transactions', async (c) => {
  const account_number = c.req.query('account_number')
  const transactions = await prisma.transaction.findMany({
    where: account_number ? { account_number: Number(account_number) } : undefined,
    orderBy: { fecha_creacion: 'desc' },
    take: 200,
  })
  return c.json(transactions)
})

app.get('/monthly-aggregations', async (c) => {
  const account_number = c.req.query('account_number')
  const aggs = await prisma.monthlyAggregation.findMany({
    where: account_number ? { account_number: Number(account_number) } : undefined,
    orderBy: [{ year: 'desc' }, { month: 'desc' }],
  })
  return c.json(aggs)
})

app.get('/cashback-runs', async (c) => {
  const runs = await prisma.cashbackRun.findMany({
    orderBy: { created_at: 'desc' },
    select: {
      id: true,
      year: true,
      month: true,
      status: true,
      total_users: true,
      total_cashback_usdt: true,
      created_at: true,
    },
  })
  return c.json(runs)
})

app.get('/cashback-runs/:id/disbursements', async (c) => {
  const cashback_run_id = c.req.param('id')
  const list = await prisma.disbursement.findMany({
    where: { cashback_run_id },
    orderBy: { alias: 'asc' },
  })
  return c.json(list)
})

process.on('SIGTERM', () => prisma.$disconnect())
process.on('SIGINT', () => prisma.$disconnect())

export default app
