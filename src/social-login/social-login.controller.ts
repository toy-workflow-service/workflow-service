import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard as NestAuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { SocialLoginService } from './social-login.service';
import { SocialRequest } from 'src/_common/interfaces/social-request.interface';
import { SocialUser } from 'src/_common/interfaces/social-user.interface';

@Controller('socialLogin')
export class SocailLoginController {
  constructor(private socialLoginService: SocialLoginService) {}

  @Get('google')
  @UseGuards(NestAuthGuard('google'))
  async loginGoogle(@Req() req: SocialRequest, @Res() res: Response): Promise<any> {
    const userDTO: SocialUser = { ...req.user };
    const { accessToken, refreshToken } = await this.socialLoginService.socialLogin(userDTO);

    res.cookie('accessToken', accessToken);
    res.cookie('refreshToken', refreshToken);

    return res.redirect('/');
  }

  @Get('kakao')
  @UseGuards(NestAuthGuard('kakao'))
  async loginKakao(@Req() req: SocialRequest, @Res() res: Response): Promise<any> {
    const userDTO: SocialUser = {
      email: req.user.email,
      name: req.user.name,
      photo: req.user.photo,
    };
    const { accessToken, refreshToken } = await this.socialLoginService.socialLogin(userDTO);

    res.cookie('accessToken', accessToken);
    res.cookie('refreshToken', refreshToken);

    return res.redirect('/');
  }

  @Get('naver')
  @UseGuards(NestAuthGuard('naver'))
  async loginNaver(@Req() req: SocialRequest, @Res() res: Response): Promise<any> {
    const userDTO: SocialUser = {
      email: req.user.email,
      name: req.user.name,
      photo: req.user.photo,
    };
    const { accessToken, refreshToken } = await this.socialLoginService.socialLogin(userDTO);

    res.cookie('accessToken', accessToken);
    res.cookie('refreshToken', refreshToken);

    return res.redirect('/');
  }
}
