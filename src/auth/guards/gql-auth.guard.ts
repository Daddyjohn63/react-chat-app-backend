import { ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

interface GqlRequest extends Request {
  cookies: {
    Authentication: string;
  };
}

interface GqlContext {
  req: GqlRequest;
}

export class GqlAuthGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext): GqlRequest {
    const ctx = GqlExecutionContext.create(context);

    return ctx.getContext<GqlContext>().req;
  }
}
