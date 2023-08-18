import { IsEmail } from 'class-validator';

export class EmailDTO {
  @IsEmail({}, { message: '이메일 형식이 올바르지 않습니다.' })
  email: string;
}
