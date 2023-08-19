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

@Module({
  imports: [RedisCacheModule, TypeOrmModule.forFeature([Board, Workspace, Workspace_Member, User])],
  exports: [TypeOrmModule],
  controllers: [BoardsController],
  providers: [BoardsService, WorkspacesService, JwtService, UsersService, MailService],
})
export class BoardsModule {}
