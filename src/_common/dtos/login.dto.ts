import { IsEmail, IsString, Length } from 'class-validator';

export class LoginDTO {
  @IsEmail({}, { message: '이메일 형식이 올바르지 않습니다.' })
  email: string;

  @IsString({ message: '비밀번호는 문자와 숫자의 조합으로 입력해 주세요.' })
  @Length(8, 20, { message: '비밀번호는 8~20자 사이로 입력해 주세요. ' })
  password: string;
}
