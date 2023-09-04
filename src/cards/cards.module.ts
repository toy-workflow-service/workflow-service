import { MiddlewareConsumer, Module, RequestMethod, UseGuards } from '@nestjs/common';
import { CardsService } from './cards.service';
import { CardsController } from './cards.controller';
import { BoardColumnsService } from 'src/board-columns/board-columns.service';
import { Board_Column } from 'src/_common/entities/board-column.entity';
import { Board } from 'src/_common/entities/board.entity';
import { BoardsService } from 'src/boards/boards.service';
import { WorkspacesService } from 'src/workspaces/workspaces.service';
import { Workspace } from 'src/_common/entities/workspace.entity';
import { Workspace_Member } from 'src/_common/entities/workspace-member.entity';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/_common/entities/user.entitiy';
import { MailService } from 'src/_common/mail/mail.service';
import { JwtService } from 'src/_common/security/jwt/jwt.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Card } from 'src/_common/entities/card.entity';
import { RedisCacheModule } from 'src/_common/cache/redis.module';
import { UploadMultiMiddleware } from 'src/_common/middlewares/upload-multi-middleware';
import { AuthGuard } from 'src/_common/security/auth.guard';

@Module({
  imports: [
    RedisCacheModule,
    TypeOrmModule.forFeature([Card, Board_Column, Board, Workspace, Workspace_Member, User]), // Card 엔티티 등록
  ],
  exports: [TypeOrmModule],
  controllers: [CardsController],
  providers: [
    CardsService,
    BoardColumnsService,
    BoardsService,
    WorkspacesService,
    UsersService,
    MailService,
    JwtService,
  ],
})
export class CardsModule {
  @UseGuards(AuthGuard)
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UploadMultiMiddleware).forRoutes({ path: '/cards', method: RequestMethod.POST });
  }
}
