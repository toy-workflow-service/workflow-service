import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateCardDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsNumber()
  sequence: number;

  @IsNotEmpty()
  color: string;
}
