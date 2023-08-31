import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '../security/jwt/jwt.service';

@Injectable()
export class validateLoginMiddleware implements NestMiddleware {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService
  ) {}
  async use(req: Request, res: Response, next: NextFunction) {
    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;

    const accessTokenVerifyErrorHandle = this.jwtService.verifyErrorHandle(accessToken, process.env.ACCESS_SECRET_KEY);
    if (accessTokenVerifyErrorHandle == 'verify success') {
      const accessTokenVerify = this.jwtService.verify(accessToken, process.env.ACCESS_SECRET_KEY);
      const findByUser = await this.usersService.tokenValidateUser(accessTokenVerify.id);
      req.user = findByUser;
      return next();
    }

    const refreshTokenVerifyErrorHandle = this.jwtService.verifyErrorHandle(
      refreshToken,
      process.env.REFRESH_SECRET_KEY
    );
    if (refreshTokenVerifyErrorHandle == 'verify success') {
      const refreshPayload = this.jwtService.verify(refreshToken, process.env.REFRESH_SECRET_KEY);
      const findByUser = await this.usersService.tokenValidateUser(refreshPayload.id);
      const accessToken = this.jwtService.sign(
        {
          id: findByUser.id,
          name: findByUser.name,
          email: findByUser.email,
          profile_url: findByUser.profile_url,
          phone_number: findByUser.phone_number,
          phone_authentication: findByUser.phone_authentication,
        },
        process.env.ACCESS_SECRET_KEY,
        process.env.ACCESS_EXPIRE_TIME
      );

      const accessTokenVerify = this.jwtService.verify(accessToken, process.env.ACCESS_SECRET_KEY);
      req.user = accessTokenVerify;
      res.setHeader('authorization', `Bearer ${accessToken}`);
      return next();
    }

    return next();
  }
}
