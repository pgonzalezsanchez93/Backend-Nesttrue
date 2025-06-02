import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { User } from '../../entities/user.entity';

@Injectable()
export class UserOwnerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request['user'] as User;
    const paramId = request.params.userId;  

    if (!user) {
      throw new UnauthorizedException('No user found in request');
    }
    
    if (!user._id) {
      throw new UnauthorizedException('User ID is missing or invalid');
    }

    const userIdStr = user._id.toString();
    
    if (!paramId) {
      throw new UnauthorizedException('User ID parameter is missing');
    }
    
    const paramIdStr = paramId.toString();
    
    if (user.roles.includes('admin') || userIdStr === paramIdStr) {
      return true;
    }

    throw new UnauthorizedException('You are not authorized to access this resource');
  }
}