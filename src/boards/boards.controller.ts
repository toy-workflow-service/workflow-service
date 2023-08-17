import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './create-board.dto';
import { UpdateBoardDto } from './update-board.dto';

@Controller('boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  //보드 조회
  @Get('/boards')
  async GetBoards(@Query('workspaceId') workspaceId: number) {
    return await this.boardsService.GetBoards(workspaceId);
  }

  //보드 상세 조회
  @Get('/boards/:boardId')
  async GetBoardById(@Query('workspaceId') workspaceId: number, @Param('boardId') id: number) {
    return await this.boardsService.GetBoardById(workspaceId, id);
  }

  //보드 생성
  @Post('/boards')
  async CreateBoard(@Query('workspaceId') workspaceId: number, @Body() data: CreateBoardDto) {
    return await this.boardsService.CreateBoard(workspaceId, data.name, data.description);
  }

  //보드 수정
  @Put('/boards/:boardId')
  async UpdateBoard(
    @Query('workspaceId') workspaceId: number,
    @Param('boardId') id: number,
    @Body() data: UpdateBoardDto,
  ) {
    return await this.boardsService.UpdateBoard(workspaceId, id, data.name, data.description);
  }

  //보드 삭제
  @Delete('/boards/:boardId')
  async DeleteBoard(@Query('workspaceId') workspaceId: number, @Param('boardId') id: number) {
    return await this.boardsService.DeleteBoard(workspaceId, id);
  }
}
