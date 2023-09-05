import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Card } from 'src/_common/entities/card.entity';
import { Comment } from 'src/_common/entities/comment.entity';
import { CardsService } from 'src/cards/cards.service';
import { BoardColumnsService } from 'src/board-columns/board-columns.service';
import { Board_Column } from 'src/_common/entities/board-column.entity';
import { Board } from 'src/_common/entities/board.entity';
import { BoardsService } from 'src/boards/boards.service';
import { WorkspacesService } from 'src/workspaces/workspaces.service';
import { Workspace } from 'src/_common/entities/workspace.entity';
import { Workspace_Member } from 'src/_common/entities/workspace-member.entity';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/_common/entities/user.entitiy';
import { MailService } from 'src/_common/mail/mail.service';
import { JwtService } from 'src/_common/security/jwt/jwt.service';
import { RedisCacheModule } from 'src/_common/cache/redis.module';
import { AuditLogsService } from 'src/audit-logs/audit-logs.service';
import { Audit_log } from 'src/_common/entities/audit-log.entity';
@Module({
  imports: [
    RedisCacheModule,
    TypeOrmModule.forFeature([Card, Comment, Board_Column, Board, Workspace, Workspace_Member, User, Audit_log]), // Card 엔티티 등록
  ],
  controllers: [CommentsController],
  providers: [
    CommentsService,
    CardsService,
    BoardColumnsService,
    BoardsService,
    WorkspacesService,
    UsersService,
    MailService,
    JwtService,
    AuditLogsService,
  ],
})
export class CommentsModule {}
