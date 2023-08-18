import { IsInt, IsNotEmpty } from 'class-validator';

export class MembershipDto {
  @IsInt()
  @IsNotEmpty({ message: '멤버십 타입을 선택해주세요.' })
  packageType: number;

  @IsInt()
  @IsNotEmpty()
  packagePrice: number;

  @IsInt()
  @IsNotEmpty({ message: '멤버십 기간을 선택해주세요.' })
  servicePeriod: number;
}
