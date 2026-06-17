import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../../../modules/users/entities/user.entity';

export const AuthUser = createParamDecorator(
  (data: keyof User | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ user: User }>();
    const user = request.user;
    if (data && user) return user[data];
    return user;
  },
);
