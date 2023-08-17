import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Query, Res } from '@nestjs/common';
import { BoardColumnsService } from './board-columns.service';
import { CreateBoardColumnDto } from '../_common/dtos/create-board-column.dto';
import { UpdateBoardColumnNameDto } from '../_common/dtos/update-board-column-name.dto';
import { UpdateBoardColumnSequenceDto } from '../_common/dtos/update-board-column-sequence.dto';
import { Response } from 'express';

@Controller('board-columns')
export class BoardColumnsController {
  constructor(private readonly boardColumnsService: BoardColumnsService) {}

  //보드 칼럼 조회
  @Get('/columns')
  async GetBoardColumns(@Query('boardId') boardId: number, @Res() res: Response) {
    const columns = await this.boardColumnsService.GetBoardColumns(boardId);
    return res.status(HttpStatus.OK).json(columns);
  }

  //보드 칼럼 생성
  @Post('/columns')
  async PostBoardColumn(@Query('boardId') boardId: number, @Body() data: CreateBoardColumnDto, @Res() res: Response) {
    await this.boardColumnsService.PostBoardColumn(boardId, data.name, data.sequence);
    return res.status(HttpStatus.CREATED).json({ message: '칼럼을 생성하였습니다.' });
  }

  //보드 칼럼 이름 수정
  @Put('/columns/:columnId')
  async UpdateBoardColumnName(
    @Query('boardId') boardId: number,
    @Param('columnId') columnId: number,
    @Body() data: UpdateBoardColumnNameDto,
    @Res() res: Response,
  ) {
    await this.boardColumnsService.UpdateBoardColumnName(boardId, columnId, data.name);
    return res.status(HttpStatus.OK).json({ message: '칼럼 이름을 수정하였습니다.' });
  }

  //보드 칼럼 시퀀스 수정
  @Put('/columns/:columnId/sequence')
  async UpdateBoardColumnSequence(
    @Query('boardId') boardId: number,
    @Param('columnId') columnId: number,
    @Body() data: UpdateBoardColumnSequenceDto,
    @Res() res: Response,
  ) {
    await this.boardColumnsService.UpdateBoardColumnSequence(boardId, columnId, data.sequence);
    return res.status(HttpStatus.OK).json({ message: '칼럼 순서를 수정하였습니다.' });
  }

  //보드 컬럼 삭제
  @Delete('/columns/:columnId')
  async DeleteBoardColumn(
    @Query('boardId') boardId: number,
    @Param('columnId') columnId: number,
    @Res() res: Response,
  ) {
    await this.boardColumnsService.DeleteBoardColumn(boardId, columnId);
    return res.status(HttpStatus.OK).json({ message: '칼럼을 삭제하였습니다.' });
  }
}
