import { IsNotEmpty, IsString, Length } from 'class-validator';

export class PasswordDTO {
  @IsNotEmpty({ message: '현재 비밀번호를 입력해 주세요.' })
  currentPassword: string;

  @IsString({ message: '변경하려는 비밀번호는 문자와 숫자의 조합으로 입력해 주세요.' })
  @Length(8, 20, { message: '변경하려는 비밀번호는 8~20자 사이로 입력해 주세요. ' })
  newPassword: string;
}
