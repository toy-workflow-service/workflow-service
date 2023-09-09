import { Module } from '@nestjs/common';
import { UserMessageRoomsService } from './user-message-rooms.service';
import { UserMessageRoomsController } from './user-message-rooms.controller';
import { JwtStrategy } from 'src/_common/security/passport/passport.jwt.strategy';
import { JwtService } from 'src/_common/security/jwt/jwt.service';
import { RedisCacheModule } from 'src/_common/cache/redis.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User_Message_Room } from 'src/_common/entities/user-message-room.entity';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/_common/entities/user.entitiy';
import { MailService } from 'src/_common/mail/mail.service';
import { Direct_Message } from 'src/_common/entities/direct-message.entity';
import { DirectMessagesService } from 'src/direct-messages/direct-messages.service';

@Module({
  imports: [RedisCacheModule, TypeOrmModule.forFeature([User_Message_Room, User, Direct_Message])],
  exports: [UserMessageRoomsModule],
  controllers: [UserMessageRoomsController],
  providers: [UserMessageRoomsService, DirectMessagesService, JwtStrategy, JwtService, UsersService, MailService],
})
export class UserMessageRoomsModule {}
