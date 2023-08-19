import { HttpException, HttpStatus, PipeTransform } from '@nestjs/common';
import { RedisCacheService } from '../cache/redis.service';

import { SocialSignUpDTO } from '../dtos/social-signup.dto';

export class SocialSignupPipe implements PipeTransform {
  constructor(private readonly cacheManager: RedisCacheService) {}

  async transform(value: SocialSignUpDTO) {
    const { tempId, phoneNumber } = value;
    if (!tempId || !phoneNumber) throw new HttpException('잘못된 접근입니다.', HttpStatus.FORBIDDEN);

    return value;
  }
}
