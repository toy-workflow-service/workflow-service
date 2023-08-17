import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { BoardColumnsService } from './board-columns.service';
import { CreateBoardColumnDto } from './create-board-column.dto';
import { UpdateBoardColumnNameDto } from './update-board-column-name.dto';
import { UpdateBoardColumnSequenceDto } from './update-board-column-sequence.dto';

@Controller('board-columns')
export class BoardColumnsController {
  constructor(private readonly boardColumnsService: BoardColumnsService) {}

  //보드 칼럼 조회
  @Get('/columns/:boardId')
  async GetBoardColumns(@Param('boardId') boardId: number) {
    return await this.boardColumnsService.GetBoardColumns(boardId);
  }

  //보드 칼럼 생성
  @Post('/columns/:boardId')
  async PostBoardColumn(@Param('boardId') boardId: number, @Body() data: CreateBoardColumnDto) {
    await this.boardColumnsService.PostBoardColumn(boardId, data.name, data.sequence);
  }

  //보드 칼럼 이름 수정
  @Put('/columns/:boardId/:columnId')
  async UpdateBoardColumnName(
    @Param('boardId') boardId: number,
    @Param('columnId') columnId: number,
    @Body() data: UpdateBoardColumnNameDto,
  ) {
    await this.boardColumnsService.UpdateBoardColumnName(boardId, columnId, data.name);
  }

  //보드 칼럼 시퀀스 수정
  @Put('/columns/:boardId/:columnId/sequence')
  async UpdateBoardColumnSequence(
    @Param('boardId') boardId: number,
    @Param('columnId') columnId: number,
    @Body() data: UpdateBoardColumnSequenceDto,
  ) {
    await this.boardColumnsService.UpdateBoardColumnSequence(boardId, columnId, data.sequence);
  }

  //보드 컬럼 삭제
  @Delete('/columns/:boardId/:columnId')
  async DeleteBoardColumn(@Param('boardId') boardId: number, @Param('columnId') columnId: number) {
    await this.boardColumnsService.DeleteBoardColumn(boardId, columnId);
  }
}
