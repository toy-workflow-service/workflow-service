import { Module } from '@nestjs/common';
import { BoardMessagesService } from './board-messages.service';
import { BoardMessagesController } from './board-messages.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board_Message } from 'src/_common/entities/board-message.entity';
import { Board } from 'src/_common/entities/board.entity';
import { User } from 'src/_common/entities/user.entitiy';
import { JwtService } from 'src/_common/security/jwt/jwt.service';
import { UsersService } from 'src/users/users.service';
import { MailService } from 'src/_common/mail/mail.service';
import { RedisCacheModule } from 'src/_common/cache/redis.module';

@Module({
  imports: [RedisCacheModule, TypeOrmModule.forFeature([Board_Message, Board, User])],
  exports: [TypeOrmModule],
  controllers: [BoardMessagesController],
  providers: [BoardMessagesService, JwtService, UsersService, MailService],
})
export class BoardMessagesModule {}
