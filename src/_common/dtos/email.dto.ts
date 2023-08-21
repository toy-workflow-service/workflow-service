import { IsEmail, IsNotEmpty } from 'class-validator';

export class EmailDTO {
  @IsNotEmpty({ message: '이메일을 입력해 주세요. ' })
  @IsEmail({}, { message: '이메일 형식이 올바르지 않습니다.' })
  email: string;
}
