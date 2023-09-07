import { IsBoolean, IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
import { Match } from '../decorators/match.decorator';

export class ChangePasswordDTO {
  @IsNotEmpty({ message: '이메일을 입력해 주세요. ' })
  @IsEmail({}, { message: '이메일 형식이 올바르지 않습니다.' })
  email: string;

  @IsNotEmpty({ message: '비밀번호를 입력해 주세요. ' })
  @IsString({ message: '비밀번호는 문자와 숫자의 조합으로 입력해 주세요.' })
  @Length(8, 20, { message: '비밀번호는 8~20자 사이로 입력해 주세요. ' })
  password: string;

  @IsNotEmpty({ message: '비밀번호 확인을 입력해 주세요. ' })
  @IsString({ message: '비밀번호 확인은 문자와 숫자의 조합으로 입력해 주세요.' })
  @Match('password', { message: '비밀번호와 비밀번호 확인이 일치하지 않습니다.' })
  confirmPassword: string;

  @IsBoolean({ message: '이메일이 인증되지 않았습니다. ' })
  emailAuth: boolean;
}
