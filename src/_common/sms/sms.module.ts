import { Module } from '@nestjs/common';
import { SMSService } from './sms.service';
import { SMSController } from './sms.controller';
import { JwtService } from '../security/jwt/jwt.service';
import { JwtStrategy } from '../security/passport/passport.jwt.strategy';
import { UsersService } from 'src/users/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entitiy';
import { MailService } from '../mail/mail.service';
import { RedisCacheModule } from '../cache/redis.module';

@Module({
  imports: [RedisCacheModule, TypeOrmModule.forFeature([User])],
  controllers: [SMSController],
  providers: [SMSService, JwtStrategy, JwtService, UsersService, MailService],
  exports: [SMSService],
})
export class SMSModule {}
