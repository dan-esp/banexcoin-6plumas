import { Controller, Get, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import type { RequestWithClerkAuth } from './auth/clerk-auth.guard';
import { Public } from './auth/public.decorator';

@ApiTags('health', 'auth')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  @ApiOkResponse({
    description: 'Private API liveness response.',
    schema: {
      type: 'string',
      example: 'Hello World!',
    },
  })
  getHello(): string {
    return this.appService.getHello();
  }

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
