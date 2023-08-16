import { Injectable } from '@nestjs/common';
import { AccessPayload } from 'src/common/interfaces/access-payload.interface';

@Injectable()
export class ViewService {
  async header(user: AccessPayload) {
    if (user) return { isLoign: true, email: user.email, name: user.name, profileUrl: user.profile_url };

    return { isLogin: false };
  }
}
