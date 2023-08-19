import { Module } from '@nestjs/common';
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
import { MentionsModule } from './mentions/mentions.module';
import { UserMessageRoomsModule } from './user-message-rooms/user-message-rooms.module';
import { DirectMessagesModule } from './direct-messages/direct-messages.module';
import { RemindersModule } from './reminders/reminders.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ormConfig } from './_common/configs/orm.config';
import { RedisCacheModule } from './_common/cache/redis.module';
import { MailModule } from './_common/mail/mail.module';
import { JwtModule } from './_common/security/jwt/jwt.module';
import { PassportModule } from '@nestjs/passport';
import { SMSModule } from './_common/sms/sms.module';
import { WorkspaceMembersModule } from './workspace-members/workspace-members.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({ useFactory: ormConfig }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
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
    MentionsModule,
    UserMessageRoomsModule,
    DirectMessagesModule,
    RemindersModule,
    WorkspaceMembersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
