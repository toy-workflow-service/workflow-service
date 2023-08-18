import { IsString } from 'class-validator';

export class CreateBoardDto {
  @IsString()
  readonly name: string;

  @IsString()
  readonly description: string;
}
