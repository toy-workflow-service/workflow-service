import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-naver';
import axios from 'axios';

@Injectable()
export class NaverStrategy extends PassportStrategy(Strategy, 'naver') {
  constructor() {
    super({
      clientID: process.env.NAVER_CLIENT_ID,
      clientSecret: process.env.NAVER_CLIENT_SECRET,
      callbackURL: process.env.NAVER_REDIRECT_URI,
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (err: any, user?: any, info?: any) => void,
  ) {
    try {
      const authInfo = await axios.post(
        'https://openapi.naver.com/v1/nid/me',
        {},
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Bearer ` + accessToken,
          },
        },
      );
      const { name } = authInfo.data.response;
      const { _json } = profile;
      const user = {
        email: _json.email,
        name,
        photo: _json.profile_image,
        accessToken,
      };

      done(null, user);
    } catch (err) {
      done(err);
    }
  }
}
