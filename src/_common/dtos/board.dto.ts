import { IsNumber, IsString, IsNotEmpty, IsArray } from 'class-validator';

export class CreateBoardDto {
  @IsString()
  @IsNotEmpty({ message: '보드명을 입력해주세요.' })
  readonly name: string;

  @IsString()
  @IsNotEmpty({ message: '보드 내용을 입력해주세요.' })
  readonly description: string;

  readonly deadline: Date;
}

export class UpdateBoardDto {
  @IsString()
  @IsNotEmpty({ message: '보드명을 입력해주세요.' })
  readonly name: string;

  @IsString()
  @IsNotEmpty({ message: '보드 내용을 입력해주세요.' })
  readonly description: string;

  readonly deadline: Date;
}

export class CreateBoardColumnDto {
  @IsString()
  @IsNotEmpty({ message: '칼럼명을 입력해주세요.' })
  readonly name: string;

  @IsNumber()
  @IsNotEmpty({ message: '칼럼순서를 입력해주세요.' })
  readonly sequence: number;
}

export class UpdateBoardColumnNameDto {
  @IsString()
  @IsNotEmpty({ message: '칼럼명을 입력해주세요.' })
  readonly name: string;
}

export class UpdateBoardColumnSequenceDto {
  @IsNumber()
  @IsNotEmpty({ message: '칼럼순서를 입력해주세요.' })
  readonly sequence: number;
}

export class CreateBoardMemberDto {
  @IsString()
  @IsNotEmpty({ message: '보드에 추가할 멤버이름을 입력해주세요.' })
  readonly name: string;
}

export class CreateBoardMessageDto {
  @IsString()
  @IsNotEmpty({ message: '메세지를 입력해주세요.' })
  readonly message: string;
}

export class BoardMemberUpdateDto {
  @IsNotEmpty()
  @IsArray()
  userIdArray: number[];
}
