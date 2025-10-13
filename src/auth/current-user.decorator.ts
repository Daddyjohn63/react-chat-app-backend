import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { User } from 'src/users/entities/user.entity';

interface RequestWithUser {
  user: User;
}

interface GqlRequestWithUser extends Request {
  user: User;
}

const getCurrentUserByContext = (context: ExecutionContext): User => {
  if (context.getType() === 'http') {
    return context.switchToHttp().getRequest<RequestWithUser>().user;
  } else if (context.getType<GqlContextType>() === 'graphql') {
    return GqlExecutionContext.create(context).getContext<{ req: GqlRequestWithUser }>().req.user;
  }
  throw new Error('Invalid context type');
};

export const CurrentUser = createParamDecorator((_data: unknown, context: ExecutionContext) =>
  getCurrentUserByContext(context),
);
