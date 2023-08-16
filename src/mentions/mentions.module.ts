import { Module } from '@nestjs/common';
import { MentionsService } from './mentions.service';
import { MentionsController } from './mentions.controller';

@Module({
  controllers: [MentionsController],
  providers: [MentionsService],
})
export class MentionsModule {}
