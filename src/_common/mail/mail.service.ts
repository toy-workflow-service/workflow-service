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

  async inviteProjectMail(email: string, userName: string, projectName: string, projectId: number): Promise<boolean> {
    await this.transporter
      .sendMail({
        to: email,
        from: process.env.EMAIL_USER,
        subject: `${projectName} 프로젝트 초대 메일`,
        html: `<form action="http://127.0.0.1:3000/projects/${projectId}/participation?email=${email}" method="POST">
                <h2>${userName}님이 ${projectName} 프로젝트에 초대했습니다. 초대 받기 버튼을 눌러주세요.</h2>
                <button>초대받기</button>
            </form>`,
      })
      .then((result: any) => {
        console.log(result);
      })
      .catch((err: any) => {
        console.log(err);
        throw new HttpException('메일 전송에 실패했습니다.', HttpStatus.CONFLICT);
      });
    return true;
  }
}
