import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: any;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PWD,
      },
    });
  }

  async sendEmail(email: string): Promise<any> {
    const code = Math.random().toString(36).substr(2, 6);
    const expireTime = Date.now() + 1000 * 60 * 3;

    await this.transporter
      .sendMail({
        to: email,
        from: process.env.EMAIL_USER,
        subject: 'Work Flow 서비스 인증 번호',
        html: `<p>이메일 인증코드는 ${code} 입니다.</p>
               <p>이 코드는 3분 후 만료됩니다.</p>`,
      })
      .then(() => {})
      .catch((err: any) => {
        console.log(err);
        throw new HttpException(['메일 전송에 실패했습니다.'], HttpStatus.CONFLICT);
      });
    return { code, expireTime };
  }

  async inviteProjectMail(email: string, userName: string, workspace: string, workspaceId: number): Promise<boolean> {
    await this.transporter
      .sendMail({
        to: email,
        from: process.env.EMAIL_USER,
        subject: `${workspace} 워크스페이스 초대 메일`,
        html: `<form action="http://127.0.0.1:3000/workspaces/${workspaceId}/participation?email=${email}" method="POST">
                <h2>${userName}님이 ${workspace}에 초대했습니다. 초대 받기 버튼을 눌러주세요.</h2>
                <button>초대받기</button>
            </form>`,
      })
      .then((result: any) => {
        console.log(result);
      })
      .catch((err: any) => {
        console.log(err);
        throw new HttpException(['메일 전송에 실패했습니다.'], HttpStatus.CONFLICT);
      });
    return true;
  }
}
