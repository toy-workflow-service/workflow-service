import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './create-board.dto';
import { UpdateBoardDto } from './update-board.dto';
import { AuthGuard } from 'src/_common/security/auth.guard';

@Controller('boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  //보드 조회
  @Get('/boards/:workspaceId')
  @UseGuards(AuthGuard)
  async GetBoards(@Param('workspaceId') workspaceId: number) {
    return await this.boardsService.GetBoards(workspaceId);
  }

  //보드 상세 조회
  @Get('/boards/:workspaceId/:boardId')
  @UseGuards(AuthGuard)
  async GetBoardById(@Param('workspaceId') workspaceId: number, @Param('boardId') id: number) {
    return await this.boardsService.GetBoardById(workspaceId, id);
  }

  //보드 생성
  @Post('/boards/:workspaceId')
  @UseGuards(AuthGuard)
  async CreateBoard(@Param('workspaceId') workspaceId: number, @Body() data: CreateBoardDto) {
    return await this.boardsService.CreateBoard(workspaceId, data.name, data.description);
  }

  //보드 수정
  @Put('/boards/:workspaceId/:boardId')
  @UseGuards(AuthGuard)
  async UpdateBoard(
    @Param('workspaceId') workspaceId: number,
    @Param('boardId') id: number,
    @Body() data: UpdateBoardDto,
  ) {
    return await this.boardsService.UpdateBoard(workspaceId, id, data.name, data.description);
  }

  //보드 삭제
  @Delete('/boards/:workspaceId/:boardId')
  @UseGuards(AuthGuard)
  async DeleteBoard(@Param('workspaceId') workspaceId: number, @Param('boardId') id: number) {
    return await this.boardsService.DeleteBoard(workspaceId, id);
  }
}
