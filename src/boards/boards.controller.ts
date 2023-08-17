import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Query, Res } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from '../_common/dtos/create-board.dto';
import { UpdateBoardDto } from '../_common/dtos/update-board.dto';
import { Response } from 'express';

@Controller('boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  //보드 조회
  @Get('/boards')
  async GetBoards(@Query('workspaceId') workspaceId: number, @Res() res: Response) {
    const boards = await this.boardsService.GetBoards(workspaceId);
    return res.status(HttpStatus.OK).json({ boards });
  }

  //보드 상세 조회
  @Get('/boards/:boardId')
  async GetBoardById(@Query('workspaceId') workspaceId: number, @Param('boardId') id: number, @Res() res: Response) {
    const board = await this.boardsService.GetBoardById(workspaceId, id);
    return res.status(HttpStatus.OK).json({ board });
  }

  //보드 생성
  @Post('/boards')
  async CreateBoard(@Query('workspaceId') workspaceId: number, @Body() data: CreateBoardDto, @Res() res: Response) {
    await this.boardsService.CreateBoard(workspaceId, data.name, data.description);
    return res.status(HttpStatus.CREATED).json({ message: '보드를 생성하였습니다.' });
  }

  //보드 수정
  @Put('/boards/:boardId')
  async UpdateBoard(
    @Query('workspaceId') workspaceId: number,
    @Param('boardId') id: number,
    @Body() data: UpdateBoardDto,
    @Res() res: Response,
  ) {
    await this.boardsService.UpdateBoard(workspaceId, id, data.name, data.description);
    return res.status(HttpStatus.OK).json({ message: '보드를 수정하였습니다.' });
  }

  //보드 삭제
  @Delete('/boards/:boardId')
  async DeleteBoard(@Query('workspaceId') workspaceId: number, @Param('boardId') id: number, @Res() res: Response) {
    await this.boardsService.DeleteBoard(workspaceId, id);
    return res.status(HttpStatus.OK).json({ message: '보드를 삭제하였습니다.' });
  }
}
