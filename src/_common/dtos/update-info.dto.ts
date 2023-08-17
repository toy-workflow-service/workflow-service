import { Length, Matches } from 'class-validator';

export class UpdateInfoDTO {
  @Length(2, 20, { message: '이름은 2~20자 사이로 입력해 주세요. ' })
  @Matches(new RegExp(/^[가-힣a-zA-Z]+$/), {
    message: '이름은 한글과 영어만 입력이 가능합니다.',
  })
  name: string;
}
