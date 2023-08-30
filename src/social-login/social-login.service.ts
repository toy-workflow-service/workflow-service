import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from 'src/_common/security/jwt/jwt.service';
import { SocialUser } from 'src/_common/interfaces/social-user.interface';
import { uuid } from 'uuidv4';

@Injectable()
export class SocialLoginService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async socialLogin(req: SocialUser): Promise<any> {
    const { email, name, photo } = req;

    const existUser = await this.usersService.findEmail(email);
    if (existUser) {
      const accessToken = this.jwtService.sign(
        {
          id: existUser.id,
          email: existUser.email,
          name: existUser.name,
          profile_url: existUser.profile_url,
          phone_number: existUser.phone_number,
          phone_authentication: existUser.phone_authentication,
        },
        process.env.ACCESS_SECRET_KEY,
        process.env.ACCESS_EXPIRE_TIME
      );
      const refreshToken = this.jwtService.sign(
        { id: existUser.id },
        process.env.REFRESH_SECRET_KEY,
        process.env.REFRESH_EXPIRE_TIME
      );
      return { accessToken, refreshToken };
    }
    const userDAO = {
      email,
      name,
      password: uuid(),
      profile_url: photo,
      phone_number: '',
    };
    const signupUser = await this.usersService.signup(userDAO);
    const accessToken = this.jwtService.sign(
      { id: signupUser.id },
      process.env.ACCESS_SECRET_KEY,
      process.env.ACCESS_EXPIRE_TIME
    );
    const refreshToken = this.jwtService.sign(
      { id: signupUser.id },
      process.env.REFRESH_SECRET_KEY,
      process.env.REFRESH_EXPIRE_TIME
    );
    return { accessToken, refreshToken };
  }
}
