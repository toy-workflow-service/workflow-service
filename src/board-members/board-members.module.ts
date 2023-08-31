import { Module } from '@nestjs/common';
import { BoardMembersService } from './board-members.service';
import { BoardMembersController } from './board-members.controller';
import { Board_Member } from 'src/_common/entities/board-member.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/_common/entities/user.entitiy';
import { JwtService } from 'src/_common/security/jwt/jwt.service';
import { UsersService } from 'src/users/users.service';
import { MailService } from 'src/_common/mail/mail.service';
import { RedisCacheModule } from 'src/_common/cache/redis.module';
import { BoardsService } from 'src/boards/boards.service';
import { Board } from 'src/_common/entities/board.entity';
import { WorkspacesService } from 'src/workspaces/workspaces.service';
import { Workspace } from 'src/_common/entities/workspace.entity';
import { Workspace_Member } from 'src/_common/entities/workspace-member.entity';
import { Board_Column } from 'src/_common/entities/board-column.entity';
import { BoardColumnsService } from 'src/board-columns/board-columns.service';
import { Board_Column } from 'src/_common/entities/board-column.entity';

@Module({
  imports: [
    RedisCacheModule,
    TypeOrmModule.forFeature([Board_Member, Board, Workspace, Workspace_Member, User, Board_Column]),
  ],
  controllers: [BoardMembersController],
  providers: [
    BoardMembersService,
    BoardsService,
    WorkspacesService,
    JwtService,
    UsersService,
    MailService,
    BoardColumnsService,
  ],
})
export class BoardMembersModule {}
