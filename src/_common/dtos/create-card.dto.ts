import { IsNotEmpty, IsString, IsNumber, IsArray } from 'class-validator';

export class CreateCardDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsString()
  file_url: string;

  @IsNotEmpty()
  @IsNumber()
  sequence: number;

  @IsNotEmpty()
  @IsArray()
  members: number[];

  @IsNotEmpty()
  color: string;
}
