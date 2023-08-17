import { Module } from '@nestjs/common';
import { BoardMembersService } from './board-members.service';
import { BoardMembersController } from './board-members.controller';
import { Board_Member } from 'src/_common/entities/board-member.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Board_Member])],
  controllers: [BoardMembersController],
  providers: [BoardMembersService],
})
export class BoardMembersModule {}
