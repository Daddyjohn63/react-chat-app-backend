import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';

interface RequestWithUser {
  user: User;
}

const getCurrentUserByContext = (context: ExecutionContext): User => {
  return context.switchToHttp().getRequest<RequestWithUser>().user;
};

export const CurrentUser = createParamDecorator((_data: unknown, context: ExecutionContext) =>
  getCurrentUserByContext(context),
);
