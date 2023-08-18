import { Module } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { BoardsController } from './boards.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from 'src/_common/entities/board.entity';
import { Workspace } from 'src/_common/entities/workspace.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Board, Workspace])],
  exports: [TypeOrmModule],
  controllers: [BoardsController],
  providers: [BoardsService],
})
export class BoardsModule {}
