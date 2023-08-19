import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ViewController } from './view.controller';
import { ViewService } from './view.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/_common/entities/user.entitiy';
import { validateLoginMiddleware } from 'src/_common/middlewares/validate-login.middleware';
import { JwtService } from 'src/_common/security/jwt/jwt.service';
import { UsersService } from 'src/users/users.service';
import { MailService } from 'src/_common/mail/mail.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [ViewController],
  providers: [ViewService, JwtService, UsersService, MailService],
})
export class ViewModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(validateLoginMiddleware).forRoutes(ViewController);
  }
}
