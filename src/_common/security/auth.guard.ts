import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard as NestAuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { RedisCacheService } from '../cache/redis.service';
import { Response } from 'express';
import { JwtService } from './jwt/jwt.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthGuard extends NestAuthGuard('jwt') {
  constructor(
    private redisCacheService: RedisCacheService,
    private jwtService: JwtService,
    private usersService: UsersService
  ) {
    super({});
  }

  //@ts-ignore
  async canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    if (!request.cookies.accessToken) throw new UnauthorizedException('토큰이 존재하지 않습니다.');

    const token = request.cookies.accessToken;

    const result = await this.tokenValidation(token);
    if (!result) throw new UnauthorizedException('이미 로그아웃한 계정입니다.');

    return super.canActivate(context);
  }

  private async tokenValidation(token: string) {
    const result = await this.redisCacheService.get(token);
    if (result === 'blackList') return false;

    return true;
  }

  //@ts-ignore
  async handleRequest(err: any, user: any, info: any, context: ExecutionContext): Promise<any> {
    if (err || !user) {
      if (info.name === 'TokenExpiredError') {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        const refreshToken = request.cookies.refreshToken;
        const user = await this.verifyRefreshToken(refreshToken, response);

        if (user) return user;
        else {
          await response.clearCookie('accessToken');
          await response.clearCookie('refreshToken');
          throw err || new UnauthorizedException('만료되었거나 잘못된 토큰입니다.');
        }
      }
      const response = context.switchToHttp().getResponse();
      await response.clearCookie('accessToken');
      await response.clearCookie('refreshToken');
      console.log('왜 여기로 들어오지?');
      throw err || new UnauthorizedException('만료되었거나 잘못된 토큰입니다.');
    }
    return user;
  }

  //refreshToken을 통한 accessToken 재발급
  async verifyRefreshToken(refreshToken: string, res: Response) {
    const refreshTokenVerify = this.jwtService.verifyErrorHandle(refreshToken, process.env.REFRESH_SECRET_KEY);
    if (refreshTokenVerify == 'verify success') {
      const user = this.jwtService.verify(refreshToken, process.env.REFRESH_SECRET_KEY);
      const userInfo = await this.usersService.tokenValidateUser(user.id);

      const accessToken = this.jwtService.sign(
        { id: userInfo.id },
        process.env.ACCESS_SECRET_KEY,
        process.env.ACCESS_EXPIRE_TIME
      );

      res.setHeader('authorization', accessToken);

      return userInfo;
    }
  }
}
