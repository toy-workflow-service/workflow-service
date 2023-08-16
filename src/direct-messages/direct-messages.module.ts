import { Module } from '@nestjs/common';
import { DirectMessagesService } from './direct-messages.service';
import { DirectMessagesController } from './direct-messages.controller';

@Module({
  controllers: [DirectMessagesController],
  providers: [DirectMessagesService],
})
export class DirectMessagesModule {}
