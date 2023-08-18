import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from '../_common/dtos/create-board.dto';
import { UpdateBoardDto } from '../_common/dtos/update-board.dto';

@Controller('boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  //보드 조회
  @Get('/boards/:workspaceId')
  async GetBoards(@Param('workspaceId') workspaceId: number) {
    return await this.boardsService.GetBoards(workspaceId);
  }

  //보드 상세 조회
  @Get('/boards/:workspaceId/:boardId')
  async GetBoardById(@Param('workspaceId') workspaceId: number, @Param('boardId') id: number) {
    return await this.boardsService.GetBoardById(workspaceId, id);
  }

  //보드 생성
  @Post('/boards/:workspaceId')
  async CreateBoard(@Param('workspaceId') workspaceId: number, @Body() data: CreateBoardDto) {
    return await this.boardsService.CreateBoard(workspaceId, data.name, data.description);
  }

  //보드 수정
  @Put('/boards/:workspaceId/:boardId')
  async UpdateBoard(
    @Param('workspaceId') workspaceId: number,
    @Param('boardId') id: number,
    @Body() data: UpdateBoardDto,
  ) {
    return await this.boardsService.UpdateBoard(workspaceId, id, data.name, data.description);
  }

  //보드 삭제
  @Delete('/boards/:workspaceId/:boardId')
  async DeleteBoard(@Param('workspaceId') workspaceId: number, @Param('boardId') id: number) {
    return await this.boardsService.DeleteBoard(workspaceId, id);
  }
}
