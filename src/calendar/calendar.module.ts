import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtService } from 'src/_common/security/jwt/jwt.service';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/_common/entities/user.entitiy';
import { MailService } from 'src/_common/mail/mail.service';
import { RedisCacheModule } from 'src/_common/cache/redis.module';
import { AuditLogsService } from 'src/audit-logs/audit-logs.service';
import { Audit_log } from 'src/_common/entities/audit-log.entity';
import { CalendarController } from './calendar.controller';
import { Calendar } from 'src/_common/entities/calendar.entity';
import { CalendarsService } from './calendar.service';
import { WorkspacesService } from 'src/workspaces/workspaces.service';
import { Workspace } from 'src/_common/entities/workspace.entity';
import { Workspace_Member } from 'src/_common/entities/workspace-member.entity';

@Module({
  imports: [RedisCacheModule, TypeOrmModule.forFeature([Calendar, Workspace, Workspace_Member, User, Audit_log])],
  exports: [TypeOrmModule],
  controllers: [CalendarController],
  providers: [CalendarsService, WorkspacesService, JwtService, UsersService, MailService, AuditLogsService],
})
export class CalendarModule {}
