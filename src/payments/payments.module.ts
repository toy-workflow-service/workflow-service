import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from 'src/_common/entities/payment.entity';
import { Workspace } from 'src/_common/entities/workspace.entity';
import { User } from 'src/_common/entities/user.entitiy';
import { Workspace_Member } from 'src/_common/entities/workspace-member.entity';
import { UsersService } from 'src/users/users.service';
import { JwtService } from 'src/_common/security/jwt/jwt.service';
import { MailService } from 'src/_common/mail/mail.service';
import { MembershipsService } from 'src/memberships/memberships.service';
import { Membership } from 'src/_common/entities/membership.entity';
import { WorkspacesService } from 'src/workspaces/workspaces.service';
import { RedisCacheModule } from 'src/_common/cache/redis.module';
import { JwtStrategy } from 'src/_common/security/passport/passport.jwt.strategy';

@Module({
  imports: [RedisCacheModule, TypeOrmModule.forFeature([Payment, User, Workspace, Workspace_Member, Membership])],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    UsersService,
    JwtService,
    JwtStrategy,
    MailService,
    WorkspacesService,
    MembershipsService,
  ],
})
export class PaymentsModule {}
