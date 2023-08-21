import { IsBoolean, IsEmail, IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { Match } from '../decorators/match.decorator';

export class SignUpDTO {
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

  @IsNotEmpty({ message: '이름을 입력해 주세요. ' })
  @Length(2, 20, { message: '이름은 2~20자 사이로 입력해 주세요. ' })
  @Matches(new RegExp(/^[가-힣a-zA-Z]+$/), {
    message: '이름은 한글과 영어만 입력이 가능합니다.',
  })
  name: string;

  profile_url: string;

  @IsNotEmpty({ message: '휴대폰 번호를 입력해 주세요. ' })
  @Length(10, 11, { message: '휴대폰 번호는 하이픈(-)을 제외한 숫자 10~11자리만 입력이 가능합니다.' })
  @Matches(/^01(?:0|1|[6-9])?(\d{3}|\d{4})?(\d{4})$/, {
    message: '휴대폰 번호는 하이픈(-)을 제외한 숫자 10~11자리만 입력이 가능합니다.',
  })
  phone_number: string;

  @IsBoolean({ message: '이메일이 인증되지 않았습니다. ' })
  emailAuth: boolean;
}
