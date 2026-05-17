import { Controller, Get, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { RequestWithClerkAuth } from './auth/clerk-auth.guard';

@ApiTags('health', 'auth')
@Controller()
export class AppController {
  @Get('auth/session')
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Authenticated Clerk session details.',
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', example: 'user_123' },
        sessionId: { type: 'string', nullable: true, example: 'sess_123' },
      },
    },
  })
  getSession(@Req() request: RequestWithClerkAuth) {
    return {
      userId: request.auth?.userId,
      sessionId: request.auth?.sessionId,
    };
  }
}
