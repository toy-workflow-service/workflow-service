import { IsString, IsNotEmpty } from 'class-validator';

export class CreateCalendarDto {
  @IsString()
  @IsNotEmpty({ message: '제목을 입력해주세요.' })
  readonly title: string;

  @IsString()
  @IsNotEmpty({ message: '내용을 입력해주세요.' })
  readonly description: string;

  @IsNotEmpty({ message: '날짜를 입력해주세요.' })
  readonly deadline: Date;

  @IsNotEmpty({ message: '날짜를 입력해주세요.' })
  readonly start_date: Date;

  @IsNotEmpty({ message: '타입을 선택해주세요.' })
  readonly type: number;
}

export class UpdateCalendarDto {
  @IsString()
  @IsNotEmpty({ message: '제목을 입력해주세요.' })
  readonly title: string;

  @IsString()
  @IsNotEmpty({ message: '내용을 입력해주세요.' })
  readonly description: string;

  @IsNotEmpty({ message: '날짜를 입력해주세요.' })
  readonly deadline: Date;

  @IsNotEmpty({ message: '날짜를 입력해주세요.' })
  readonly start_date: Date;

  @IsNotEmpty({ message: '타입을 선택해주세요.' })
  readonly type: number;
}
