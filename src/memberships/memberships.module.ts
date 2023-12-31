import { Module } from '@nestjs/common';
import { MembershipsController } from './memberships.controller';
import { MembershipsService } from './memberships.service';
import { Membership } from 'src/_common/entities/membership.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';
import { JwtService } from 'src/_common/security/jwt/jwt.service';
import { User } from 'src/_common/entities/user.entitiy';
import { MailService } from 'src/_common/mail/mail.service';
import { WorkspacesService } from 'src/workspaces/workspaces.service';
import { Workspace } from 'src/_common/entities/workspace.entity';
import { Workspace_Member } from 'src/_common/entities/workspace-member.entity';
//import { ScheduleModule } from '@nestjs/schedule';
import { RedisCacheModule } from 'src/_common/cache/redis.module';
import { JwtStrategy } from 'src/_common/security/passport/passport.jwt.strategy';
import { AuditLogsService } from 'src/audit-logs/audit-logs.service';
import { Audit_log } from 'src/_common/entities/audit-log.entity';

@Module({
  imports: [RedisCacheModule, TypeOrmModule.forFeature([Membership, User, Workspace, Workspace_Member, Audit_log])],
  controllers: [MembershipsController],
  providers: [
    MembershipsService,
    UsersService,
    JwtService,
    JwtStrategy,
    MailService,
    WorkspacesService,
    AuditLogsService,
  ],
})
export class MembershipsModule {}
