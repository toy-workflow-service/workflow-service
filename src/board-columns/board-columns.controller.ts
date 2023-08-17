import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { BoardColumnsService } from './board-columns.service';
import { CreateBoardColumnDto } from '../_common/dtos/create-board-column.dto';
import { UpdateBoardColumnNameDto } from '../_common/dtos/update-board-column-name.dto';
import { UpdateBoardColumnSequenceDto } from '../_common/dtos/update-board-column-sequence.dto';

@Controller('board-columns')
export class BoardColumnsController {
  constructor(private readonly boardColumnsService: BoardColumnsService) {}

  //보드 칼럼 조회
  @Get('/columns')
  async GetBoardColumns(@Query('boardId') boardId: number) {
    return await this.boardColumnsService.GetBoardColumns(boardId);
  }

  //보드 칼럼 생성
  @Post('/columns')
  async PostBoardColumn(@Query('boardId') boardId: number, @Body() data: CreateBoardColumnDto) {
    await this.boardColumnsService.PostBoardColumn(boardId, data.name, data.sequence);
  }

  //보드 칼럼 이름 수정
  @Put('/columns/:columnId')
  async UpdateBoardColumnName(
    @Query('boardId') boardId: number,
    @Param('columnId') columnId: number,
    @Body() data: UpdateBoardColumnNameDto,
  ) {
    await this.boardColumnsService.UpdateBoardColumnName(boardId, columnId, data.name);
  }

  //보드 칼럼 시퀀스 수정
  @Put('/columns/:columnId/sequence')
  async UpdateBoardColumnSequence(
    @Query('boardId') boardId: number,
    @Param('columnId') columnId: number,
    @Body() data: UpdateBoardColumnSequenceDto,
  ) {
    await this.boardColumnsService.UpdateBoardColumnSequence(boardId, columnId, data.sequence);
  }

  //보드 컬럼 삭제
  @Delete('/columns/:columnId')
  async DeleteBoardColumn(@Query('boardId') boardId: number, @Param('columnId') columnId: number) {
    await this.boardColumnsService.DeleteBoardColumn(boardId, columnId);
  }
}
