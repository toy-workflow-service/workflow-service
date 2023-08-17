import { IsEmail, IsString, Length, Matches } from 'class-validator';
import { Match } from '../decorators/match.decorator';

export class SignUpDTO {
  @IsEmail({}, { message: '이메일 형식이 올바르지 않습니다.' })
  email: string;

  @IsString({ message: '비밀번호는 문자와 숫자의 조합으로 입력해 주세요.' })
  @Length(8, 20, { message: '비밀번호는 8~20자 사이로 입력해 주세요. ' })
  password: string;

  @IsString({ message: '비밀번호 확인은 문자와 숫자의 조합으로 입력해 주세요.' })
  @Match('password', { message: '비밀번호와 비밀번호 확인이 일치하지 않습니다.' })
  confirmPassword: string;

  @Length(2, 20, { message: '이름은 2~20자 사이로 입력해 주세요. ' })
  @Matches(new RegExp(/^[가-힣a-zA-Z]+$/), {
    message: '이름은 한글과 영어만 입력이 가능합니다.',
  })
  name: string;

  profile_url: string;

  phone_number: number;
}
