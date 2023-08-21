import { Controller, Get, Render, Req } from '@nestjs/common';
import { ViewService } from './view.service';
import { AccessPayload } from 'src/_common/interfaces/access-payload.interface';

@Controller()
export class ViewController {
  constructor(private viewService: ViewService) {}

  @Get()
  @Render('index.ejs')
  async index(@Req() req: AccessPayload) {
    const user: AccessPayload = req.user;
    const header = await this.viewService.header(user);
    return { title: 'Work Flow', subtitle: '메인페이지', header };
  }

  @Get('workspace')
  @Render('workspace.ejs')
  async workspace(@Req() req: AccessPayload) {
    const user: AccessPayload = req.user;
    const header = await this.viewService.header(user);
    return { title: 'Work Flow', subtitle: '워크스페이스', header };
  }

  /**No header & footer */

  @Get('signup')
  @Render('signup.ejs')
  async signup() {
    return { title: 'Work Flow', subtitle: '회원가입' };
  }

  @Get('login')
  @Render('login.ejs')
  async login() {
    return { title: 'Work Flow', subtitle: '로그인' };
  }

  @Get('findPassword')
  @Render('find-password.ejs')
  async findPassword() {
    return { title: 'Work Flow', subtitle: '비밀번호 찾기' };
  }
}
