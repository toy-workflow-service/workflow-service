import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard as NestAuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { RedisCacheService } from '../cache/redis.service';

@Injectable()
export class AuthGuard extends NestAuthGuard('jwt') {
  constructor(private redisCacheService: RedisCacheService) {
    super({});
  }

  //@ts-ignore
  async canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    if (!request.headers.authorization) throw new UnauthorizedException('토큰이 존재하지 않습니다.');

    const token = request.headers.authorization.split(' ')[1];
    const result = await this.tokenValidation(token);

    if (!result) throw new UnauthorizedException('이미 로그아웃한 계정입니다.');
    return super.canActivate(context);
  }

  private async tokenValidation(token: string) {
    const result = await this.redisCacheService.get(token);
    if (result === 'blackList') return false;

    return true;
  }
}
