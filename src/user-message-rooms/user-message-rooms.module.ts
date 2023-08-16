import { Module } from '@nestjs/common';
import { UserMessageRoomsService } from './user-message-rooms.service';
import { UserMessageRoomsController } from './user-message-rooms.controller';

@Module({
  controllers: [UserMessageRoomsController],
  providers: [UserMessageRoomsService],
})
export class UserMessageRoomsModule {}
