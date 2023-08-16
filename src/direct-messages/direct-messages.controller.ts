import { Controller } from '@nestjs/common';
import { DirectMessagesService } from './direct-messages.service';

@Controller('direct-messages')
export class DirectMessagesController {
  constructor(private readonly directMessagesService: DirectMessagesService) {}
}
