import { Module } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { BoardsController } from './boards.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from 'src/_common/entities/board.entity';
import { JwtService } from 'src/_common/security/jwt/jwt.service';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/_common/entities/user.entitiy';
import { MailService } from 'src/_common/mail/mail.service';
import { RedisCacheModule } from 'src/_common/cache/redis.module';
import { WorkspacesService } from 'src/workspaces/workspaces.service';
import { Workspace } from 'src/_common/entities/workspace.entity';
import { Workspace_Member } from 'src/_common/entities/workspace-member.entity';
import { Board_Column } from 'src/_common/entities/board-column.entity';
import { AuditLogsService } from 'src/audit-logs/audit-logs.service';
import { Audit_log } from 'src/_common/entities/audit-log.entity';

@Module({
  imports: [
    RedisCacheModule,
    TypeOrmModule.forFeature([Board, Board_Column, Workspace, Workspace_Member, User, Audit_log]),
  ],
  exports: [TypeOrmModule],
  controllers: [BoardsController],
  providers: [BoardsService, WorkspacesService, JwtService, UsersService, MailService, AuditLogsService],
})
export class BoardsModule {}
