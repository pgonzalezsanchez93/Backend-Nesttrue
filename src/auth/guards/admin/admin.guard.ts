import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request['user'];

    if (!user) {
      throw new UnauthorizedException('No user found in request');
    }

    // Check if the user has admin role
    if (!user.roles.includes('admin')) {
      throw new UnauthorizedException('User is not authorized for this action');
    }

    return true;
  }
}