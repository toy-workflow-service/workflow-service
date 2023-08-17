import { Module } from '@nestjs/common';
import { BoardMembersService } from './board-members.service';
import { BoardMembersController } from './board-members.controller';
import { Board_Member } from 'src/_common/entities/board-member.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from 'src/_common/entities/board.entity';
import { User } from 'src/_common/entities/user.entitiy';

@Module({
  imports: [TypeOrmModule.forFeature([Board_Member, Board, User])],
  exports: [TypeOrmModule],
  controllers: [BoardMembersController],
  providers: [BoardMembersService],
})
export class BoardMembersModule {}
