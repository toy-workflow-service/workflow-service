import { Body, Controller, Get, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard as NestAuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { SocialLoginService } from './social-login.service';
import { RedisCacheService } from 'src/_common/cache/redis.service';
import { SocialRequest } from 'src/_common/interfaces/social-request.interface';
import { SocialUser } from 'src/_common/interfaces/social-user.interface';

@Controller('socialLogin')
export class SocailLoginController {
  constructor(
    private socialLoginService: SocialLoginService,
    private cacheManager: RedisCacheService,
  ) {}

  private tempUserInfo = (email: string, name: string, profileUrl: string): any => {
    let userInfo = [];
    const tempId: string = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, '0');
    userInfo.push(email);
    userInfo.push(name);
    userInfo.push(profileUrl);
    return { key: tempId, value: userInfo.join(' ') };
  };

  @Get('google')
  @UseGuards(NestAuthGuard('google'))
  async loginGoogle(@Req() req: SocialRequest, @Res() res: Response): Promise<any> {
    const userDTO: SocialUser = { ...req.user };
    const { accessToken, refreshToken, userName, email, name, profileUrl } =
      await this.socialLoginService.socialLogin(userDTO);

    if (accessToken && refreshToken) {
      res.setHeader('authorization', `Bearer ${accessToken}`);
      res.cookie('refreshToken', refreshToken);

      return res.status(HttpStatus.OK).json({ message: `${userName}님 환영합니다. ` });
    } else {
      const { key, value } = this.tempUserInfo(email, name, profileUrl);
      this.cacheManager.set(key, value, 600);

      res.redirect(`http://127.0.0.1:3000/addInfo?tempId=${key}`);
    }
  }

  @Get('kakao')
  @UseGuards(NestAuthGuard('kakao'))
  async loginKakao(@Req() req: SocialRequest, @Res() res: Response): Promise<any> {
    const userDTO: SocialUser = {
      email: req.user.email,
      name: req.user.name,
      photo: req.user.photo,
    };

    const { accessToken, refreshToken, userName, email, name, profileUrl } =
      await this.socialLoginService.socialLogin(userDTO);

    if (accessToken && refreshToken) {
      res.setHeader('authorization', `Bearer ${accessToken}`);
      res.cookie('refreshToken', refreshToken);

      return res.status(HttpStatus.OK).json({ message: `${userName}님 환영합니다. ` });
    } else {
      const { key, value } = this.tempUserInfo(email, name, profileUrl);
      this.cacheManager.set(key, value, 600);

      res.redirect(`http://127.0.0.1:3000/addInfo?tempId=${key}`);
    }
  }

  @Get('naver')
  @UseGuards(NestAuthGuard('naver'))
  async loginNaver(@Req() req: SocialRequest, @Res() res: Response): Promise<any> {
    const userDTO: SocialUser = {
      email: req.user.email,
      name: req.user.name,
      photo: req.user.photo,
    };
    const { accessToken, refreshToken, userName, email, name, profileUrl } =
      await this.socialLoginService.socialLogin(userDTO);

    if (accessToken && refreshToken) {
      res.setHeader('authorization', `Bearer ${accessToken}`);
      res.cookie('refreshToken', refreshToken);

      return res.status(HttpStatus.OK).json({ message: `${userName}님 환영합니다. ` });
    } else {
      const { key, value } = this.tempUserInfo(email, name, profileUrl);
      this.cacheManager.set(key, value, 600);

      res.redirect(`http://127.0.0.1:3000/addInfo?tempId=${key}`);
    }
  }
}
