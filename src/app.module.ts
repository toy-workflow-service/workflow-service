import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ViewModule } from './view/view.module';
import { UsersModule } from './users/users.module';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { BoardsModule } from './boards/boards.module';
import { BoardColumnsModule } from './board-columns/board-columns.module';
import { BoardMessagesModule } from './board-messages/board-messages.module';
import { BoardMembersModule } from './board-members/board-members.module';
import { CardsModule } from './cards/cards.module';
import { CommentsModule } from './comments/comments.module';
import { UserMessageRoomsModule } from './user-message-rooms/user-message-rooms.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ormConfig } from './_common/configs/orm.config';
import { RedisCacheModule } from './_common/cache/redis.module';
import { MailModule } from './_common/mail/mail.module';
import { JwtModule } from './_common/security/jwt/jwt.module';
import { PassportModule } from '@nestjs/passport';
import { SMSModule } from './_common/sms/sms.module';
import { SocialLoginModule } from './social-login/social-login.module';
import { PaymentsModule } from './payments/payments.module';
import { MembershipsModule } from './memberships/memberships.module';
import { EventsModule } from './events/events.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { DirectMessagesModule } from './direct-messages/direct-messages.module';
import { CalendarModule } from './calendar/calendar.module';
import { BlockingIpMiddleWare } from './_common/middlewares/blocking-ip-middleware';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({ useFactory: ormConfig }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    ScheduleModule.forRoot(),
    ViewModule,
    UsersModule,
    MailModule,
    SMSModule,
    JwtModule,
    RedisCacheModule,
    WorkspacesModule,
    BoardsModule,
    BoardMembersModule,
    BoardColumnsModule,
    BoardMessagesModule,
    CardsModule,
    CommentsModule,
    CalendarModule,
    UserMessageRoomsModule,
    SocialLoginModule,
    PaymentsModule,
    MembershipsModule,
    EventsModule,
    AuditLogsModule,
    DirectMessagesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(BlockingIpMiddleWare)
      .forRoutes(
        { path: '*', method: RequestMethod.POST },
        { path: '*', method: RequestMethod.PATCH },
        { path: '*', method: RequestMethod.PUT }
      );
  }
}
