import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../../interfaces/jwt-payload';
import { AuthService } from '../../services/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  
  constructor(
    private jwtService: JwtService,
    private authService: AuthService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token not found');
    }

    try {
      const payload = this.jwtService.verify<JwtPayload>(token);
      
      
      const user = await this.authService.findUserById(payload.id);
      
      if (!user) {
        throw new UnauthorizedException('User not found');
      }


      if (!user.isActive) {
        throw new UnauthorizedException('User account is deactivated');
      }

      request['user'] = user;

      return true;
    } catch (error) {
      if (error.message === 'User account is deactivated') {
        throw new UnauthorizedException('Tu cuenta ha sido desactivada. Contacta al administrador.');
      }
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers['authorization']?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}