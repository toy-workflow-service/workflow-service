import { Body, Controller, HttpStatus, Post, Res, UseGuards } from '@nestjs/common';
import { PhoneNumberDTO } from '../dtos/phone.dto';
import { Response } from 'express';
import { SMSService } from './sms.service';
import { AuthGuard } from '../security/auth.guard';
import { UsersService } from 'src/users/users.service';
import { GetUser } from '../decorators/get-user.decorator';
import { AccessPayload } from '../interfaces/access-payload.interface';

@Controller('sms')
export class SMSController {
  constructor(
    private smsService: SMSService,
    private usersService: UsersService
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  async sendSMS(
    @GetUser() user: AccessPayload,
    @Body() phoneNumberDTO: PhoneNumberDTO,
    @Res() res: Response
  ): Promise<Object> {
    await this.usersService.searchPhoneNumber(user.id, phoneNumberDTO.phoneNumber);
    return res.status(HttpStatus.OK).json({
      message: '휴대폰 인증 메시지를 전송했습니다. 인증 만료시간은 3분 입니다.',
      code: '000000',
      expireTime: Date.now() + 1000 * 60 * 3,
    });
    const { code, expireTime } = await this.smsService.sendSMS(phoneNumberDTO.phoneNumber);
    return res
      .status(HttpStatus.OK)
      .json({ message: '휴대폰 인증 메시지를 전송했습니다. 인증 만료시간은 3분 입니다.', code, expireTime });
  }
}
