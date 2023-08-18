import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { PhoneNumberDTO } from '../dtos/phone.dto';
import { Response } from 'express';
import { SMSService } from './sms.service';

@Controller('sms')
export class SMSController {
  constructor(private smsService: SMSService) {}

  @Post()
  async sendSMS(@Body() phoneNumber: PhoneNumberDTO, @Res() res: Response): Promise<Object> {
    const { code, expireTime } = await this.smsService.sendSMS(phoneNumber.phoneNumber);
    return res.status(HttpStatus.OK).json({ message: '휴대폰 인증 메시지를 전송했습니다.', code, expireTime });
  }
}
