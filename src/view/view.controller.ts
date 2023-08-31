import { Controller, Get, Render, Req, UseGuards } from '@nestjs/common';
import { ViewService } from './view.service';
import { AccessPayload } from 'src/_common/interfaces/access-payload.interface';
import { ViewAuthGuard } from 'src/_common/security/view-auth.guard';

@Controller()
export class ViewController {
  constructor(private viewService: ViewService) {}

  @Get()
  @Render('index.ejs')
  async index(@Req() req: AccessPayload) {
    const user: AccessPayload = req.user;
    const header = await this.viewService.header(user);
    return { title: 'Work-Flow', subtitle: '메인 페이지', header };
  }

  @Get('maintenance')
  @Render('maintenance.ejs')
  async maintenance(@Req() req: AccessPayload) {
    const user: AccessPayload = req.user;
    const header = await this.viewService.header(user);
    return { title: 'Work-Flow', subtitle: '유지보수 페이지', header };
  }

  @Get('workspace')
  @UseGuards(ViewAuthGuard)
  @Render('workspace.ejs')
  async workspace(@Req() req: AccessPayload) {
    const user: AccessPayload = req.user;
    const header = await this.viewService.header(user);
    return { title: 'Work-Flow', subtitle: '워크스페이스', header };
  }

  @Get('userInfo')
  @UseGuards(ViewAuthGuard)
  @Render('user-info.ejs')
  async userInfo(@Req() req: AccessPayload) {
    const user: AccessPayload = req.user;
    const header = await this.viewService.header(user);
    if (header.phoneNumber.length === 11) {
      header.phoneNumber = `${header.phoneNumber.substring(0, 3)}-${header.phoneNumber.substring(
        3,
        7
      )}-${header.phoneNumber.substring(7, 11)}`;
    } else {
      header.phoneNumber = `${header.phoneNumber.substring(0, 3)}-${header.phoneNumber.substring(
        3,
        6
      )}-${header.phoneNumber.substring(6, 10)}`;
    }

    return { title: 'Work-Flow', subtitle: '마이 페이지', header };
  }

  @Get('board')
  @UseGuards(ViewAuthGuard)
  @Render('board.ejs')
  async board(@Req() req: AccessPayload) {
    const user: AccessPayload = req.user;
    const header = await this.viewService.header(user);
    return { title: 'Work-Flow', subtitle: '보드', header };
  }

  @Get('workspaceDetail')
  @UseGuards(ViewAuthGuard)
  @Render('workspace-detail.ejs')
  async workspaceDetail(@Req() req: AccessPayload) {
    const user: AccessPayload = req.user;
    const workspaceId = req.query.workspaceId;
    const header = await this.viewService.header(user);
    return { title: 'Work-Flow', subtitle: '워크스페이스 상세보기', header, workspaceId };
  }

  @Get('chat')
  @UseGuards(ViewAuthGuard)
  @Render('chat.ejs')
  async chatRoom(@Req() req: AccessPayload) {
    const user: AccessPayload = req.user;
    const header = await this.viewService.header(user);
    return { title: 'Woer-Flow', subtitle: '내 채팅방', header };
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
