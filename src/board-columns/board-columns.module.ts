import { Module } from '@nestjs/common';
import { BoardColumnsService } from './board-columns.service';
import { BoardColumnsController } from './board-columns.controller';

@Module({
  controllers: [BoardColumnsController],
  providers: [BoardColumnsService],
})
export class BoardColumnsModule {}
