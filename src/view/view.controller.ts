import { Controller, Get, Render, Req } from '@nestjs/common';
import { ViewService } from './view.service';
import { AccessPayload } from 'src/_common/interfaces/access-payload.interface';
import { request } from 'express';

@Controller()
export class ViewController {
  constructor(private viewService: ViewService) {}

  @Get()
  @Render('index.ejs')
  async index(@Req() req: AccessPayload) {
    const user: AccessPayload = req.user;
    const header = await this.viewService.header(user);
    return { title: 'Work Flow', subtitle: '메인 페이지', header };
  }

  @Get('maintenance')
  @Render('maintenance.ejs')
  async maintenance(@Req() req: AccessPayload) {
    const user: AccessPayload = req.user;
    const header = await this.viewService.header(user);
    return { title: 'Work Flow', subtitle: '유지보수 페이지', header };
  }

  @Get('userInfo')
  @Render('user-info.ejs')
  async userInfo(@Req() req: AccessPayload) {
    const user: AccessPayload = req.user;
    const header = await this.viewService.header(user);
    return { title: 'Work Flow', subtitle: '마이 페이지', header };
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

  @Get('kanban')
  @Render('kanban.ejs')
  async kanban() {
    return { title: 'Work Flow', subtitle: 'board' };
  }
}
