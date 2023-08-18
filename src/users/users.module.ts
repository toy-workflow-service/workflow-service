import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/_common/entities/user.entitiy';
import { UploadMiddleware } from 'src/_common/middlewares/upload-middleware';
import { JwtStrategy } from 'src/_common/security/passport.jwt.strategy';
import { RedisCacheModule } from 'src/_common/cache/redis.module';
import { JwtService } from 'src/_common/security/jwt/jwt.service';
import { MailService } from 'src/_common/mail/mail.service';

@Module({
  imports: [RedisCacheModule, TypeOrmModule.forFeature([User])],
  exports: [UsersModule],
  controllers: [UsersController],
  providers: [UsersService, JwtStrategy, JwtService, MailService],
})
export class UsersModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(UploadMiddleware)
      .forRoutes(
        { path: '/users/signup', method: RequestMethod.POST },
        { path: '/users', method: RequestMethod.PATCH },
      );
  }
}
