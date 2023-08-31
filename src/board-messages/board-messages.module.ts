import { MiddlewareConsumer, Module, RequestMethod, UseGuards } from '@nestjs/common';
import { BoardMessagesService } from './board-messages.service';
import { BoardMessagesController } from './board-messages.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board_Message } from 'src/_common/entities/board-message.entity';
import { User } from 'src/_common/entities/user.entitiy';
import { JwtService } from 'src/_common/security/jwt/jwt.service';
import { UsersService } from 'src/users/users.service';
import { MailService } from 'src/_common/mail/mail.service';
import { RedisCacheModule } from 'src/_common/cache/redis.module';
import { BoardsService } from 'src/boards/boards.service';
import { Board } from 'src/_common/entities/board.entity';
import { Workspace } from 'src/_common/entities/workspace.entity';
import { Workspace_Member } from 'src/_common/entities/workspace-member.entity';
import { WorkspacesService } from 'src/workspaces/workspaces.service';
import { BoardMembersService } from 'src/board-members/board-members.service';
import { Board_Member } from 'src/_common/entities/board-member.entity';
import { AuthGuard } from 'src/_common/security/auth.guard';
import { UploadFileMiddleware } from 'src/_common/middlewares/upload-file-middleware';
import { Board_Column } from 'src/_common/entities/board-column.entity';
import { BoardColumnsService } from 'src/board-columns/board-columns.service';

@Module({
  imports: [
    RedisCacheModule,
    TypeOrmModule.forFeature([Board_Message, Board, Workspace, Workspace_Member, User, Board_Member, Board_Column]),
  ],
  exports: [TypeOrmModule],
  controllers: [BoardMessagesController],
  providers: [
    BoardMessagesService,
    BoardsService,
    WorkspacesService,
    JwtService,
    UsersService,
    MailService,
    BoardMembersService,
    BoardColumnsService,
  ],
})
export class BoardMessagesModule {
  @UseGuards(AuthGuard)
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(UploadFileMiddleware)
      .forRoutes({ path: '/boardMessages/:boardId/upload', method: RequestMethod.POST });
  }
}
