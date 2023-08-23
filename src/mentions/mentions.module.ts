import { Module } from '@nestjs/common';
import { MentionsService } from './mentions.service';
import { MentionsController } from './mentions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mention } from 'src/_common/entities/mention.entity';
import { User } from 'src/_common/entities/user.entitiy';
import { RedisCacheModule } from 'src/_common/cache/redis.module';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { MailService } from 'src/_common/mail/mail.service';
import { CommentsService } from 'src/comments/comments.service';
import { BoardMessagesService } from 'src/board-messages/board-messages.service';
import { DirectMessagesService } from 'src/direct-messages/direct-messages.service';
import { Board_Message } from 'src/_common/entities/board-message.entity';
import { Direct_Message } from 'src/_common/entities/direct-message.entity';

@Module({
  imports: [RedisCacheModule, TypeOrmModule.forFeature([Mention, Comment, Board_Message, Direct_Message, User])],
  exports: [TypeOrmModule],
  controllers: [MentionsController],
  providers: [
    MentionsService,
    CommentsService,
    BoardMessagesService,
    DirectMessagesService,
    JwtService,
    UsersService,
    MailService,
  ],
})
export class MentionsModule {}
