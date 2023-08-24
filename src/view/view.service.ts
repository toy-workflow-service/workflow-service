import { Injectable } from '@nestjs/common';
import { AccessPayload } from 'src/_common/interfaces/access-payload.interface';

@Injectable()
export class ViewService {
  async header(user: AccessPayload) {
    if (user)
      return {
        isLogin: true,
        email: user.email,
        name: user.name,
        profileUrl: user.profile_url ? user.profile_url : '/assets/img/favicon.png',
        phoneNumber: user.phone_number,
        phoneAuthentication: user.phone_authentication,
      };

    return { isLogin: false };
  }
}
