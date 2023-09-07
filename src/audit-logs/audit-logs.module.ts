import { Module } from '@nestjs/common';
import { AuditLogsController } from './audit-logs.controller';
import { AuditLogsService } from './audit-logs.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Audit_log } from 'src/_common/entities/audit-log.entity';
import { JwtService } from 'src/_common/security/jwt/jwt.service';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/_common/entities/user.entitiy';
import { JwtStrategy } from 'src/_common/security/passport/passport.jwt.strategy';
import { MailService } from 'src/_common/mail/mail.service';
import { RedisCacheModule } from 'src/_common/cache/redis.module';

@Module({
  imports: [RedisCacheModule, TypeOrmModule.forFeature([Audit_log, User])],
  controllers: [AuditLogsController],
  providers: [AuditLogsService, UsersService, JwtService, JwtStrategy, MailService],
})
export class AuditLogsModule {}
