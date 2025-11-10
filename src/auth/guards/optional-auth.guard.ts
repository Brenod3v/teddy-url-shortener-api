import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { Observable } from 'rxjs';

@Injectable()
export class OptionalAuthGuard extends AuthGuard('jwt') {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.headers?.authorization;

    if (!token) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err: unknown, user: unknown): any {
    if (err || !user) {
      return null;
    }
    return user;
  }
}
