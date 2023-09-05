import { IsEmail, IsInt, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateWorkspaceDto {
  @IsString()
  @IsNotEmpty({ message: '워크스페이스명을 입력해주세요.' })
  @MinLength(2, { message: '워크스페이스명은 최소 2글자 이상입니다.' })
  @MaxLength(10, { message: '워크스페이스명은 최대 10글자 이하입니다.' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: '워크스페이스 타입을 선택해주세요.' })
  type: string;

  @IsString()
  @IsNotEmpty({ message: '워크스페이스 소개를 입력해주세요.' })
  @MaxLength(500, { message: '소개는 최대 250글자 이하입니다.' })
  description: string;
}

export class UpdateWorkspaceDto {
  @IsNotEmpty({ message: '워크스페이스 이름을 입력해주세요.' })
  @MinLength(2, { message: '워크스페이스명은 최소 2글자 이상입니다.' })
  @MaxLength(30, { message: '워크스페이스명은 최대 30글자 이하입니다.' })
  name: string;

  @IsNotEmpty({ message: '워크스페이스 타입을 선택해주세요.' })
  type: string;

  @IsNotEmpty({ message: '워크스페이스 소개를 입력해주세요.' })
  @MaxLength(500, { message: '소개는 최대 250글자 이하입니다.' })
  description: string;
}

export class InvitationDto {
  @IsString()
  @IsEmail({}, { message: '이메일 형식이 올바르지 않습니다.' })
  email: string;

  @IsInt()
  @IsNotEmpty({ message: '멤버 역할을 선택해주세요.' })
  role: number;
}

export class SetRoleDto {
  @IsInt()
  @IsNotEmpty({ message: '멤버 역할을 선택해주세요.' })
  role: number;
}
