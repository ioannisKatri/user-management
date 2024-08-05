import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TokenManagerService } from '../../token-manager/token-manager.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly tokenManagerService: TokenManagerService) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];
    if (token && this.tokenManagerService.isTokenBlacklisted(token)) {
      throw new UnauthorizedException('Token has been blacklisted');
    }
    return super.canActivate(context);
  }
}
