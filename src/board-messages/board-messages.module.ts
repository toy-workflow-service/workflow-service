import { Module } from '@nestjs/common';
import { BoardMessagesService } from './board-messages.service';
import { BoardMessagesController } from './board-messages.controller';

@Module({
  controllers: [BoardMessagesController],
  providers: [BoardMessagesService],
})
export class BoardMessagesModule {}
