import { Module } from '@nestjs/common';
import { BoardColumnsService } from './board-columns.service';
import { BoardColumnsController } from './board-columns.controller';
import { Board_Column } from 'src/_common/entities/board-column.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/_common/entities/user.entitiy';
import { JwtService } from 'src/_common/security/jwt/jwt.service';
import { UsersService } from 'src/users/users.service';
import { MailService } from 'src/_common/mail/mail.service';
import { RedisCacheModule } from 'src/_common/cache/redis.module';
import { BoardsService } from 'src/boards/boards.service';

@Module({
  imports: [RedisCacheModule, TypeOrmModule.forFeature([Board_Column, User])],
  exports: [TypeOrmModule],
  controllers: [BoardColumnsController],
  providers: [BoardColumnsService, BoardsService, JwtService, UsersService, MailService],
})
export class BoardColumnsModule {}
