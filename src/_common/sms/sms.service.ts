import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import * as crypto from 'crypto';

const ACCESS_KEY = process.env.NAVER_ACCESS_KEY;
const SECRET_KEY = process.env.NAVER_SECRET_KEY;
const SERVICE_ID = process.env.NAVER_SMS_SERVICE_ID;

@Injectable()
export class SMSService {
  constructor() {}
  private makeSignitureForSMS = (): string => {
    const message = [];
    const hmac = crypto.createHmac('sha256', SECRET_KEY);
    const timeStamp = Date.now().toString();
    const space = ' ';
    const newLine = '\n';
    const method = 'POST';

    message.push(method);
    message.push(space);
    message.push(`/sms/v2/services/${SERVICE_ID}/messages`);
    message.push(newLine);
    message.push(timeStamp);
    message.push(newLine);
    message.push(ACCESS_KEY);

    const signature = hmac.update(message.join('')).digest('base64');
    return signature.toString();
  };

  private makeRandomNumber = (): number => {
    const randomNumber = Math.floor(Math.random() * 1000000);
    return randomNumber;
  };

  async sendSMS(phoneNumber: string): Promise<any> {
    const code = this.makeRandomNumber().toString().padStart(6, '0');
    const expireTime = Date.now() + 1000 * 60 * 3;
    const headers = {
      'Content-Type': 'application/json; charset=utf-8',
      'x-ncp-apigw-timestamp': Date.now().toString(),
      'x-ncp-iam-access-key': ACCESS_KEY,
      'x-ncp-apigw-signature-v2': this.makeSignitureForSMS(),
    };
    const body = {
      type: 'SMS',
      contentType: 'COMM',
      countryCode: '82',
      from: '01065800728',
      subject: 'Work Flow service 인증문자',
      content: `인증번호는 [${code}] 입니다. `,
      messages: [
        {
          to: phoneNumber,
        },
      ],
    };

    await axios
      .post(`https://sens.apigw.ntruss.com/sms/v2/services/${SERVICE_ID}/messages`, body, { headers })
      .catch(async (err) => {
        console.error(err.response.data);
        throw new InternalServerErrorException('메일 전송 중 오류가 발생 했습니다.');
      });

    return { code, expireTime };
  }
}
