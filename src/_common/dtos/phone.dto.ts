import { IsString, Length, Matches } from 'class-validator';

export class PhoneNumberDTO {
  @IsString({ message: '휴대폰 번호를 입력해 주세요.' })
  @Length(10, 11, { message: '휴대폰 번호는 하이픈(-)을 제외한 숫자 10~11자리만 입력이 가능합니다.' })
  @Matches(/^01(?:0|1|[6-9])?(\d{3}|\d{4})?(\d{4})$/, {
    message: '휴대폰 번호는 하이픈(-)을 제외한 숫자 10~11자리만 입력이 가능합니다.',
  })
  phoneNumber: string;
}
