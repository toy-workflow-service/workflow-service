import { Module } from '@nestjs/common';
import { BoardMessagesService } from './board-messages.service';
import { BoardMessagesController } from './board-messages.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board_Message } from 'src/_common/entities/board-message.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Board_Message])],
  exports: [TypeOrmModule],
  controllers: [BoardMessagesController],
  providers: [BoardMessagesService],
})
export class BoardMessagesModule {}
