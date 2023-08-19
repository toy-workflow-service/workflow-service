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
}
