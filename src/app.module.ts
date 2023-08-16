import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ViewModule } from './view/view.module';
import { UsersModule } from './users/users.module';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { WorkspaceMembersModule } from './workspace-members/workspace-members.module';
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

@Module({
  imports: [ViewModule, UsersModule, WorkspacesModule, WorkspaceMembersModule, BoardsModule, BoardColumnsModule, BoardMessagesModule, BoardMembersModule, CardsModule, CommentsModule, MentionsModule, UserMessageRoomsModule, DirectMessagesModule, RemindersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
