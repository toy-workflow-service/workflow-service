import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateWorkspaceDto {
  @IsString()
  @IsNotEmpty({ message: '워크스페이스 이름을 입력해주세요.' })
  @MinLength(2, { message: '이름은 최소 2글자 이상입니다.' })
  @MaxLength(30, { message: '이름은 최대 30글자 이하입니다.' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: '워크스페이스 타입을 입력해주세요.' })
  type: string;

  @IsString()
  @IsNotEmpty({ message: '워크스페이스 소개를 입력해주세요.' })
  @MaxLength(500, { message: '소개는 최대 500글자 이하입니다.' })
  description: string;
}
