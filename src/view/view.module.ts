import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ViewController } from './view.controller';
import { ViewService } from './view.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/_common/entities/user.entitiy';
import { validateLoginMiddleware } from 'src/_common/middlewares/validate-login.middleware';
import { JwtService } from 'src/_common/security/jwt/jwt.service';
import { UsersService } from 'src/users/users.service';
import { MailService } from 'src/_common/mail/mail.service';
import { WorkspacesService } from 'src/workspaces/workspaces.service';
import { Workspace } from 'src/_common/entities/workspace.entity';
import { Workspace_Member } from 'src/_common/entities/workspace-member.entity';
import { AuditLogsService } from 'src/audit-logs/audit-logs.service';
import { Audit_log } from 'src/_common/entities/audit-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Workspace, Workspace_Member, Audit_log])],
  controllers: [ViewController],
  providers: [ViewService, JwtService, UsersService, MailService, WorkspacesService, AuditLogsService],
})
export class ViewModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(validateLoginMiddleware).forRoutes(ViewController);
  }
}
