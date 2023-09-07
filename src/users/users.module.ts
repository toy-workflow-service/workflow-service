import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/_common/entities/user.entitiy';
import { UploadImageMiddleware } from 'src/_common/middlewares/upload-image-middleware';
import { JwtStrategy } from 'src/_common/security/passport/passport.jwt.strategy';
import { RedisCacheModule } from 'src/_common/cache/redis.module';
import { JwtService } from 'src/_common/security/jwt/jwt.service';
import { MailService } from 'src/_common/mail/mail.service';
import { WorkspacesService } from 'src/workspaces/workspaces.service';
import { Workspace } from 'src/_common/entities/workspace.entity';
import { Workspace_Member } from 'src/_common/entities/workspace-member.entity';
import { Payment } from 'src/_common/entities/payment.entity';
import { Membership } from 'src/_common/entities/membership.entity';
import { PaymentsService } from 'src/payments/payments.service';
import { MembershipsService } from 'src/memberships/memberships.service';
import { AuditLogsService } from 'src/audit-logs/audit-logs.service';
import { Audit_log } from 'src/_common/entities/audit-log.entity';

@Module({
  imports: [
    RedisCacheModule,
    TypeOrmModule.forFeature([User, Workspace, Workspace_Member, Payment, Membership, Audit_log]),
  ],
  exports: [UsersModule],
  controllers: [UsersController],
  providers: [
    UsersService,
    JwtStrategy,
    JwtService,
    MailService,
    WorkspacesService,
    PaymentsService,
    MembershipsService,
    AuditLogsService,
  ],
})
export class UsersModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(UploadImageMiddleware)
      .forRoutes(
        { path: '/users/signup', method: RequestMethod.POST },
        { path: '/users/updateProfileImage', method: RequestMethod.PATCH }
      );
  }
}
