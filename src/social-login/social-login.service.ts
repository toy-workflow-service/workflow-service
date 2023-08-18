import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from 'src/_common/security/jwt/jwt.service';
import { SocialUser } from 'src/_common/interfaces/social-user.interface';

@Injectable()
export class SocialLoginService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async socialLogin(req: SocialUser): Promise<any> {
    const { email, name, photo } = req;

    const existUser = await this.usersService.findEmail(email, name);
    if (existUser) {
      const accessToken = this.jwtService.sign(
        { id: existUser.id },
        process.env.ACCESS_SECRET_KEY,
        process.env.ACCESS_EXPIRE_TIME,
      );
      const refreshToken = this.jwtService.sign(
        { id: existUser.id },
        process.env.REFRESH_SECRET_KEY,
        process.env.REFRESH_EXPIRE_TIME,
      );
      return { accessToken, refreshToken, userName: existUser.name };
    } else {
      return { email, name, profileUrl: photo };
    }
  }
}
