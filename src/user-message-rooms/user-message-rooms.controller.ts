import { Controller } from '@nestjs/common';
import { UserMessageRoomsService } from './user-message-rooms.service';

@Controller('user-message-rooms')
export class UserMessageRoomsController {
  constructor(private readonly userMessageRoomsService: UserMessageRoomsService) {}
}
