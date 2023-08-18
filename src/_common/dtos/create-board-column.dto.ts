import { IsNumber, IsString } from 'class-validator';

export class CreateBoardColumnDto {
  @IsString()
  readonly name: string;

  @IsNumber()
  readonly sequence: number;
}
