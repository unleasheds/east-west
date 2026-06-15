import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest<{ user?: User }>();
    if (!req.user?.isAdmin) throw new ForbiddenException('Admin access required');
    return true;
  }
}
