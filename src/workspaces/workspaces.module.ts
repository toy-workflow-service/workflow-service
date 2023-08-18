import { Module } from '@nestjs/common';
import { WorkspacesController } from './workspaces.controller';
import { WorkspacesService } from './workspaces.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Workspace } from 'src/_common/entities/workspace.entity';
import { Workspace_Member } from 'src/_common/entities/workspace-member.entity';
import { JwtStrategy } from 'src/_common/security/passport.jwt.strategy';
import { JwtService } from 'src/_common/security/jwt/jwt.service';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/_common/entities/user.entitiy';
import { MailService } from 'src/_common/mail/mail.service';

@Module({
  imports: [TypeOrmModule.forFeature([Workspace, Workspace_Member, User])],
  controllers: [WorkspacesController],
  providers: [WorkspacesService, UsersService, JwtStrategy, JwtService, MailService],
})
export class WorkspacesModule {}
