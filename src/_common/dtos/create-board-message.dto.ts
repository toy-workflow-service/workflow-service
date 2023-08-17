import { IsString } from 'class-validator';

export class CreateBoardMessageDto {
  @IsString()
  readonly message: string;
}
