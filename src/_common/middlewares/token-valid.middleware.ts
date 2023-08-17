import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '../security/jwt/jwt.service';
import { RequestInfo } from '../interfaces/request-info.interface';

@Injectable()
export class TokenValidMiddleware implements NestMiddleware {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async use(req: RequestInfo, res: Response, next: NextFunction) {
    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;

    const accessTokenVerify = this.jwtService.verifyErrorHandle(accessToken, process.env.ACCESS_SECRET_KEY);
    if (accessTokenVerify == 'verify success') {
      const loginUser = this.jwtService.verify(accessToken, process.env.ACCESS_SECRET_KEY);
      req.user = loginUser;
      return next();
    }

    const refreshTokenVerify = this.jwtService.verifyErrorHandle(refreshToken, process.env.REFRESH_SECRET_KEY);
    if (refreshTokenVerify == 'verify success') {
      const user = this.jwtService.verify(refreshToken, process.env.REFRESH_SECRET_KEY);
      const userInfo = await this.usersService.tokenValidateUser(user.id);

      const accessToken = this.jwtService.sign(
        {
          id: userInfo.id,
          name: userInfo.name,
          email: userInfo.email,
          phone_number: userInfo.phone_number,
          profile_url: userInfo.profile_url,
        },
        process.env.ACCESS_SECRET_KEY,
        process.env.ACCESS_EXPIRE_TIME,
      );

      const loginUser = this.jwtService.verify(accessToken, process.env.ACCESS_SECRET_KEY);
      req.user = loginUser;
      res.cookie('accessToken', accessToken);
      return next();
    }

    return next();
  }
}
