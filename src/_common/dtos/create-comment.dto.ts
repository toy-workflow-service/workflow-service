import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateCommentDto {
  @IsOptional()
  @IsNumber()
  reply_id: number;

  @IsNotEmpty({ message: '내용을 입력해주세요.' })
  @IsString()
  comment: string;
}
