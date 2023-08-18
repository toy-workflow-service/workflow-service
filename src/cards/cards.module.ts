import { Module } from '@nestjs/common';
import { CardsService } from './cards.service';
import { CardsController } from './cards.controller';
import { BoardColumnsService } from 'src/board-columns/board-columns.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Card } from 'src/_common/entities/card.entity';
import { Board_Column } from 'src/_common/entities/board-column.entity';
import { Board } from 'src/_common/entities/board.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Card, Board_Column, Board]), // Card 엔티티 등록
  ],
  controllers: [CardsController],
  providers: [CardsService, BoardColumnsService],
})
export class CardsModule {}
