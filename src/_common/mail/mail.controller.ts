import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { EmailDTO } from '../dtos/email.dto';
import { MailService } from './mail.service';
import { Response } from 'express';

@Controller('mail')
export class MailController {
  constructor(private mailService: MailService) {}
  @Post()
  async sendEmail(@Body() emailDTO: EmailDTO, @Res() res: Response): Promise<Object> {
    const { code, expireTime } = await this.mailService.sendEmail(emailDTO.email);
    return res.status(HttpStatus.OK).json({ message: '이메일이 전송되었습니다. ', code, expireTime });
  }
}
