import { Module } from '@nestjs/common';
import { BoardMembersService } from './board-members.service';
import { BoardMembersController } from './board-members.controller';

@Module({
  controllers: [BoardMembersController],
  providers: [BoardMembersService],
})
export class BoardMembersModule {}
