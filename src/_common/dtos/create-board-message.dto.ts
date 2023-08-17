import { IsString } from 'class-validator';

export class CreateBoardMessageDto {
  @IsString()
  readonly message: string;

  @IsString()
  readonly file_url: string | null;
}
