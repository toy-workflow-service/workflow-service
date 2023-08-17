import { Module } from '@nestjs/common';
import { BoardColumnsService } from './board-columns.service';
import { BoardColumnsController } from './board-columns.controller';
import { Board_Column } from 'src/_common/entities/board-column.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Board_Column])],
  exports: [TypeOrmModule],
  controllers: [BoardColumnsController],
  providers: [BoardColumnsService],
})
export class BoardColumnsModule {}
