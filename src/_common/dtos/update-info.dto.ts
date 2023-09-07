import { IsEmail, IsNotEmpty, Length, Matches } from 'class-validator';

export class UpdateInfoDTO {
  @IsNotEmpty({ message: '이메일을 입력해 주세요. ' })
  @IsEmail({}, { message: '이메일 형식이 올바르지 않습니다.' })
  email: string;

  @IsNotEmpty({ message: '이름을 입력해 주세요. ' })
  @Length(2, 20, { message: '이름은 2~20자 사이로 입력해 주세요. ' })
  @Matches(new RegExp(/^[가-힣a-zA-Z]+$/), {
    message: '이름은 한글과 영어만 입력이 가능합니다.',
  })
  name: string;
}
