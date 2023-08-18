import { Module } from '@nestjs/common';
import { BoardColumnsService } from './board-columns.service';
import { BoardColumnsController } from './board-columns.controller';
import { Board_Column } from 'src/_common/entities/board-column.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/_common/entities/user.entitiy';
import { JwtService } from 'src/_common/security/jwt/jwt.service';
import { UsersService } from 'src/users/users.service';
import { MailService } from 'src/_common/mail/mail.service';
import { RedisCacheModule } from 'src/_common/cache/redis.module';
import { BoardsService } from 'src/boards/boards.service';
import { Board } from 'src/_common/entities/board.entity';
import { Workspace } from 'src/_common/entities/workspace.entity';
import { Workspace_Member } from 'src/_common/entities/workspace-member.entity';
import { WorkspacesService } from 'src/workspaces/workspaces.service';

@Module({
  imports: [RedisCacheModule, TypeOrmModule.forFeature([Board_Column, Board, Workspace, Workspace_Member, User])],
  exports: [TypeOrmModule],
  controllers: [BoardColumnsController],
  providers: [BoardColumnsService, BoardsService, WorkspacesService, JwtService, UsersService, MailService],
})
export class BoardColumnsModule {}
