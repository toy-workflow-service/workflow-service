import { Module } from '@nestjs/common';
import { WorkspacesController } from './workspaces.controller';
import { WorkspacesService } from './workspaces.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Workspace } from 'src/_common/entities/workspace.entity';
import { Workspace_Member } from 'src/_common/entities/workspace-member.entity';
import { JwtStrategy } from 'src/_common/security/passport/passport.jwt.strategy';
import { JwtService } from 'src/_common/security/jwt/jwt.service';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/_common/entities/user.entitiy';
import { MailService } from 'src/_common/mail/mail.service';
import { RedisCacheModule } from 'src/_common/cache/redis.module';
import { Audit_log } from 'src/_common/entities/audit-log.entity';
import { AuditLogsService } from 'src/audit-logs/audit-logs.service';

@Module({
  imports: [RedisCacheModule, TypeOrmModule.forFeature([Workspace, Workspace_Member, User, Audit_log])],
  controllers: [WorkspacesController],
  providers: [WorkspacesService, UsersService, JwtStrategy, JwtService, MailService, AuditLogsService],
})
export class WorkspacesModule {}
