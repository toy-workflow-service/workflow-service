import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { BoardsService } from './boards.service';
import { Response } from 'express';
import { CreateBoardDto, UpdateBoardDto } from 'src/_common/dtos/board.dto';
import { AuthGuard } from 'src/_common/security/auth.guard';
import { CheckAuthInterceptor } from 'src/_common/interceptors/check-auth-interceptors';
import { GetUser } from 'src/_common/decorators/get-user.decorator';
import { AccessPayload } from 'src/_common/interfaces/access-payload.interface';

@Controller('boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  //보드 조회
  @Get()
  @UseGuards(AuthGuard)
  async GetBoards(@Query('workspaceId') workspaceId: number, @Res() res: Response) {
    const boards = await this.boardsService.GetBoards(workspaceId);
    return res.status(HttpStatus.OK).json({ boards });
  }

  //보드 상세 조회
  @Get('/:boardId')
  @UseGuards(AuthGuard)
  async GetBoardById(@Query('workspaceId') workspaceId: number, @Param('boardId') id: number, @Res() res: Response) {
    const board = await this.boardsService.GetBoard(workspaceId, id);
    return res.status(HttpStatus.OK).json({ board });
  }

  //보드 생성
  @Post()
  @UseGuards(AuthGuard)
  @UseInterceptors(CheckAuthInterceptor)
  async CreateBoard(
    @Query('workspaceId') workspaceId: number,
    @Body() data: CreateBoardDto,
    @Res() res: Response
  ): Promise<Object> {
    const newBoard = await this.boardsService.CreateBoard(workspaceId, data.name, data.description);
    return res.status(HttpStatus.CREATED).json({ newBoard, message: '보드를 생성하였습니다.' });
  }

  //보드 수정
  @Put('/:boardId')
  @UseGuards(AuthGuard)
  @UseInterceptors(CheckAuthInterceptor)
  async UpdateBoard(
    @Query('workspaceId') workspaceId: number,
    @Param('boardId') id: number,
    @Body() data: UpdateBoardDto,
    @Res() res: Response
  ) {
    await this.boardsService.UpdateBoard(workspaceId, id, data.name, data.description);
    return res.status(HttpStatus.OK).json({ message: '보드를 수정하였습니다.' });
  }

  //보드 삭제
  @Delete('/:boardId')
  @UseGuards(AuthGuard)
  @UseInterceptors(CheckAuthInterceptor)
  async DeleteBoard(@Query('workspaceId') workspaceId: number, @Param('boardId') id: number, @Res() res: Response) {
    await this.boardsService.DeleteBoard(workspaceId, id);
    return res.status(HttpStatus.OK).json({ message: '보드를 삭제하였습니다.' });
  }

  @Get('getBoards/joinBoards')
  @UseGuards(AuthGuard)
  async getJoinBoards(@GetUser() user: AccessPayload, @Res() res: Response): Promise<Object> {
    const joinBoards = await this.boardsService.GetJoinBoards(user.id);
    return res.status(HttpStatus.OK).json({ joinBoards, userName: user.name });
  }
}
