import { Module } from '@nestjs/common';
import { BoardColumnsService } from './board-columns.service';
import { BoardColumnsController } from './board-columns.controller';
import { Board_Column } from 'src/_common/entities/board-column.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from 'src/_common/entities/board.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Board_Column, Board])],
  exports: [TypeOrmModule, BoardColumnsService],
  controllers: [BoardColumnsController],
  providers: [BoardColumnsService],
})
export class BoardColumnsModule {}
