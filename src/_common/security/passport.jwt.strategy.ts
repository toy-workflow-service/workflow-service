import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { UsersService } from 'src/users/users.service';
import { AccessPayload } from '../interfaces/access-payload.interface';
import { Response } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.ACCESS_SECRET_KEY,
      ignoreExpiration: false,
    });
  }

  async validate(payload: AccessPayload, res: Response): Promise<any> {
    const user = await this.usersService.tokenValidateUser(payload.id);
    if (!user) throw new UnauthorizedException('토큰 사용자가 존재하지 않습니다.');

    return user;
  }
}
