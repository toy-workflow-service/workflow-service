import { MiddlewareConsumer, Module, RequestMethod, UseGuards } from '@nestjs/common';
import { DirectMessagesService } from './direct-messages.service';
import { DirectMessagesController } from './direct-messages.controller';
import { RedisCacheModule } from 'src/_common/cache/redis.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User_Message_Room } from 'src/_common/entities/user-message-room.entity';
import { User } from 'src/_common/entities/user.entitiy';
import { Direct_Message } from 'src/_common/entities/direct-message.entity';
import { JwtStrategy } from 'src/_common/security/passport/passport.jwt.strategy';
import { JwtService } from 'src/_common/security/jwt/jwt.service';
import { UsersService } from 'src/users/users.service';
import { MailService } from 'src/_common/mail/mail.service';
import { AuthGuard } from 'src/_common/security/auth.guard';
import { UploadFileMiddleware } from 'src/_common/middlewares/upload-file-middleware';
import { UserMessageRoomsService } from 'src/user-message-rooms/user-message-rooms.service';

@Module({
  imports: [RedisCacheModule, TypeOrmModule.forFeature([User_Message_Room, User, Direct_Message])],
  exports: [DirectMessagesModule],
  providers: [DirectMessagesService, JwtStrategy, JwtService, UsersService, MailService, UserMessageRoomsService],
  controllers: [DirectMessagesController],
})
export class DirectMessagesModule {
  @UseGuards(AuthGuard)
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(UploadFileMiddleware)
      .forRoutes({ path: '/directMessages/:roomId/upload', method: RequestMethod.POST });
  }
}
