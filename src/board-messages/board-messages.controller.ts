import { Controller } from '@nestjs/common';
import { BoardMessagesService } from './board-messages.service';

@Controller('board-messages')
export class BoardMessagesController {
  constructor(private readonly boardMessagesService: BoardMessagesService) {}
}
