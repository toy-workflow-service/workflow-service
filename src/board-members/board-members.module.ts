import { Module } from '@nestjs/common';
import { BoardMembersService } from './board-members.service';
import { BoardMembersController } from './board-members.controller';
import { Board_Member } from 'src/_common/entities/board-member.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/_common/entities/user.entitiy';
import { JwtService } from 'src/_common/security/jwt/jwt.service';
import { UsersService } from 'src/users/users.service';
import { MailService } from 'src/_common/mail/mail.service';
import { RedisCacheModule } from 'src/_common/cache/redis.module';
import { BoardsService } from 'src/boards/boards.service';

@Module({
  imports: [RedisCacheModule, TypeOrmModule.forFeature([Board_Member, User])],
  exports: [TypeOrmModule],
  controllers: [BoardMembersController],
  providers: [BoardMembersService, BoardsService, JwtService, UsersService, MailService],
})
export class BoardMembersModule {}
