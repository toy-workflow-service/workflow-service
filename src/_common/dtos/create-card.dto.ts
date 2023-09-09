import { IsNotEmpty, IsString, IsNumber, IsArray } from 'class-validator';

export class CreateCardDto {
  @IsNotEmpty({ message: '카드명을 입력해주세요.' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: '내용을 입력해주세요.' })
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsNumber()
  sequence: number;

  // @IsNotEmpty()
  // @IsArray()
  // members: any[];

  @IsNotEmpty({ message: '색을 입력해주세요.' })
  color: string;
}
