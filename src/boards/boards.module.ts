import { Module } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { BoardsController } from './boards.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from 'src/_common/entities/board.entity';
import { JwtService } from 'src/_common/security/jwt/jwt.service';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/_common/entities/user.entitiy';
import { MailService } from 'src/_common/mail/mail.service';
import { RedisCacheModule } from 'src/_common/cache/redis.module';
import { WorkspacesService } from 'src/workspaces/workspaces.service';

@Module({
  imports: [RedisCacheModule, TypeOrmModule.forFeature([Board, User])],
  exports: [TypeOrmModule],
  controllers: [BoardsController],
  providers: [BoardsService, JwtService, UsersService, MailService, WorkspacesService],
})
export class BoardsModule {}
