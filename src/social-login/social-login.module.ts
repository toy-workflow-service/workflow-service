import { Module } from '@nestjs/common';
import { SocailLoginController } from './social-login.controller';
import { GoogleStrategy } from 'src/_common/security/passport/passport.google.strategy';
import { SocialLoginService } from './social-login.service';
import { UsersService } from 'src/users/users.service';
import { RedisCacheModule } from 'src/_common/cache/redis.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/_common/entities/user.entitiy';
import { JwtService } from 'src/_common/security/jwt/jwt.service';
import { MailService } from 'src/_common/mail/mail.service';
import { KakaoStrategy } from 'src/_common/security/passport/passport.kakao.strategy';
import { NaverStrategy } from 'src/_common/security/passport/passport.naver.strategy';

@Module({
  imports: [RedisCacheModule, TypeOrmModule.forFeature([User])],
  controllers: [SocailLoginController],
  exports: [SocialLoginModule],
  providers: [UsersService, JwtService, MailService, GoogleStrategy, SocialLoginService, KakaoStrategy, NaverStrategy],
})
export class SocialLoginModule {}
