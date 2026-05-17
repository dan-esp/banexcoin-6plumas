import { verifyToken } from '@clerk/backend'
import type { Context, MiddlewareHandler } from 'hono'

type ClerkClaims = Record<string, unknown>

type SelectedClerkClaims = {
  authorizedParty?: string
  organizationId?: string
  organizationRole?: string
  role?: string
}

export type ClerkAuthContext = {
  userId: string
  sessionId?: string
  claims: SelectedClerkClaims
  token: string
}

function parseList(value: string | undefined): string[] | undefined {
  const parsed = value
    ?.split(',')
    .map((item) => item.trim())
    .filter(Boolean)

  return parsed?.length ? parsed : undefined
}

function readBearerToken(header: string | undefined): string | undefined {
  if (!header) return undefined

  const [scheme, token] = header.split(' ')
  if (scheme?.toLowerCase() !== 'bearer' || !token) return undefined

  return token
}

function unauthorized(c: Context) {
  return c.json({ error: 'unauthorized' }, 401)
}

function forbidden(c: Context) {
  return c.json({ error: 'forbidden' }, 403)
}

function readClaim(claims: ClerkClaims, key: string): string | undefined {
  const value = claims[key]
  return typeof value === 'string' ? value : undefined
}

function selectClaims(claims: ClerkClaims): SelectedClerkClaims {
  return {
    authorizedParty: readClaim(claims, 'azp'),
    organizationId: readClaim(claims, 'org_id'),
    organizationRole: readClaim(claims, 'org_role'),
    role: readClaim(claims, 'role'),
  }
}

export function getAuth(c: Context): ClerkAuthContext | undefined {
  return c.get('auth')
}

export const requireAuth: MiddlewareHandler = async (c, next) => {
  const token = readBearerToken(c.req.header('authorization'))

  if (!token) {
    return unauthorized(c)
  }

  try {
    const claims = (await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
      authorizedParties: parseList(process.env.CLERK_AUTHORIZED_PARTIES),
    })) as ClerkClaims

    const userId = typeof claims.sub === 'string' ? claims.sub : undefined
    if (!userId) throw new Error('missing subject')

    c.set('auth', {
      userId,
      sessionId: typeof claims.sid === 'string' ? claims.sid : undefined,
      claims: selectClaims(claims),
      token,
    })

    return next()
  } catch {
    return unauthorized(c)
  }
}

export function requireRole(...roles: string[]): MiddlewareHandler {
  return async (c, next) => {
    const auth = getAuth(c)
    if (!auth) {
      return unauthorized(c)
    }

    const availableRoles = [auth.claims.role, auth.claims.organizationRole].filter(
      Boolean
    )

    if (!roles.some((role) => availableRoles.includes(role))) {
      return forbidden(c)
    }

    return next()
  }
}
