import { verifyToken } from '@clerk/backend';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { IS_PUBLIC_ROUTE } from './public.decorator';
import { REQUIRED_ROLES } from './roles.decorator';

type ClerkClaims = Record<string, unknown>;

type SelectedClerkClaims = {
  authorizedParty?: string;
  organizationId?: string;
  organizationRole?: string;
  role?: string;
};

export type ClerkAuthContext = {
  userId: string;
  sessionId?: string;
  claims: SelectedClerkClaims;
  token: string;
};

export type RequestWithClerkAuth = Request & {
  auth?: ClerkAuthContext;
};

function parseList(value: string | undefined): string[] | undefined {
  const parsed = value
    ?.split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  return parsed?.length ? parsed : undefined;
}

function readBearerToken(header: string | undefined): string | undefined {
  if (!header) {
    return undefined;
  }

  const [scheme, token] = header.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    return undefined;
  }

  return token;
}

function readClaim(claims: ClerkClaims, key: string): string | undefined {
  const value = claims[key];
  return typeof value === 'string' ? value : undefined;
}

function selectClaims(claims: ClerkClaims): SelectedClerkClaims {
  return {
    authorizedParty: readClaim(claims, 'azp'),
    organizationId: readClaim(claims, 'org_id'),
    organizationRole: readClaim(claims, 'org_role'),
    role: readClaim(claims, 'role'),
  };
}

function hasRequiredRole(
  claims: SelectedClerkClaims,
  requiredRoles: string[] | undefined,
): boolean {
  if (!requiredRoles?.length) {
    return true;
  }

  const availableRoles = [claims.role, claims.organizationRole].filter(Boolean);

  return requiredRoles.some((role) => availableRoles.includes(role));
}

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_ROUTE,
      [context.getHandler(), context.getClass()],
    );

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithClerkAuth>();
    const token = readBearerToken(request.headers.authorization);

    if (!token) {
      throw new UnauthorizedException({ error: 'unauthorized' });
    }

    try {
      const claims = (await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY,
        authorizedParties: parseList(process.env.CLERK_AUTHORIZED_PARTIES),
      })) as ClerkClaims;

      const userId = typeof claims.sub === 'string' ? claims.sub : undefined;
      if (!userId) {
        throw new Error('missing subject');
      }

      request.auth = {
        userId,
        sessionId: typeof claims.sid === 'string' ? claims.sid : undefined,
        claims: selectClaims(claims),
        token,
      };

      const requiredRoles = this.reflector.getAllAndOverride<string[]>(
        REQUIRED_ROLES,
        [context.getHandler(), context.getClass()],
      );

      if (!hasRequiredRole(request.auth.claims, requiredRoles)) {
        throw new ForbiddenException({ error: 'forbidden' });
      }

      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }

      throw new UnauthorizedException({ error: 'unauthorized' });
    }
  }
}
