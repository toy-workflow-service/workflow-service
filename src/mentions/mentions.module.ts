import { Module } from '@nestjs/common';
import { MentionsService } from './mentions.service';
import { MentionsController } from './mentions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mention } from 'src/_common/entities/mention.entity';
import { User } from 'src/_common/entities/user.entitiy';
import { Comment } from 'src/_common/entities/comment.entity';
import { RedisCacheModule } from 'src/_common/cache/redis.module';
import { UsersService } from 'src/users/users.service';
import { MailService } from 'src/_common/mail/mail.service';
import { CommentsService } from 'src/comments/comments.service';
import { BoardMessagesService } from 'src/board-messages/board-messages.service';
import { DirectMessagesService } from 'src/direct-messages/direct-messages.service';
import { Board_Message } from 'src/_common/entities/board-message.entity';
import { Direct_Message } from 'src/_common/entities/direct-message.entity';
import { CardsService } from 'src/cards/cards.service';
import { Card } from 'src/_common/entities/card.entity';
import { BoardColumnsService } from 'src/board-columns/board-columns.service';
import { Board_Column } from 'src/_common/entities/board-column.entity';
import { BoardsService } from 'src/boards/boards.service';
import { Board } from 'src/_common/entities/board.entity';
import { WorkspacesService } from 'src/workspaces/workspaces.service';
import { Workspace } from 'src/_common/entities/workspace.entity';
import { Workspace_Member } from 'src/_common/entities/workspace-member.entity';
import { JwtService } from 'src/_common/security/jwt/jwt.service';
import { BoardMembersService } from 'src/board-members/board-members.service';
import { Board_Member } from 'src/_common/entities/board-member.entity';

@Module({
  imports: [
    RedisCacheModule,
    TypeOrmModule.forFeature([
      Mention,
      Comment,
      Board_Message,
      Direct_Message,
      User,
      Card,
      Board_Column,
      Board,
      Workspace,
      Workspace_Member,
      Board_Member,
    ]),
  ],
  exports: [TypeOrmModule],
  controllers: [MentionsController],
  providers: [
    BoardColumnsService,
    MentionsService,
    CardsService,
    CommentsService,
    WorkspacesService,
    BoardsService,
    BoardMessagesService,
    DirectMessagesService,
    JwtService,
    UsersService,
    MailService,
    BoardMembersService,
  ],
})
export class MentionsModule {}
