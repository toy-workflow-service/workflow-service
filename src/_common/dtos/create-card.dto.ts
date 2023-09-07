import { IsNotEmpty, IsString, IsNumber, IsArray } from 'class-validator';

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

  // @IsNotEmpty()
  // @IsArray()
  // members: any[];

  @IsNotEmpty()
  color: string;
}
