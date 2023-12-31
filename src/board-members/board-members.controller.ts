import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Res, UseGuards } from '@nestjs/common';
import { BoardMembersService } from './board-members.service';
import { Response } from 'express';
import { BoardMemberUpdateDto, CreateBoardMemberDto } from 'src/_common/dtos/board.dto';
import { AuthGuard } from 'src/_common/security/auth.guard';

@Controller('')
export class BoardMembersController {
  constructor(private readonly boardMembersService: BoardMembersService) {}

  //보드 멤버 초대
  @Post('/boards/:boardId/members')
  @UseGuards(AuthGuard)
  async CreateBoardMember(@Param('boardId') boardId: number, @Body() data: CreateBoardMemberDto, @Res() res: Response) {
    const result = await this.boardMembersService.CreateBoardMember(boardId, data.userId);
    return res
      .status(HttpStatus.CREATED)
      .json({ message: '보드에 멤버를 초대하였습니다.', userId: result.userId, boardName: result.boardName });
  }

  //보드 멤버 조회
  @Get('/boards/:boardId/members')
  @UseGuards(AuthGuard)
  async GetBoardMembers(@Param('boardId') boardId: number, @Res() res: Response) {
    const members = await this.boardMembersService.GetBoardMembers(boardId);
    return res.status(HttpStatus.OK).json({ boardMembers: members });
  }

  //보드 멤버 제외
  @Delete('/boards/:boardId/members/:userId')
  @UseGuards(AuthGuard)
  async DeleteBoardMember(@Param('boardId') boardId: number, @Param('userId') userId: number, @Res() res: Response) {
    await this.boardMembersService.DeleteBoardMember(boardId, userId);
    return res.status(HttpStatus.OK).json({ message: '보드에서 해당 멤버를 제외하였습니다.' });
  }

  //보드 멤버 업데이트
  @Put('/boards/:boardId/members')
  @UseGuards(AuthGuard)
  async UpdateBoardMember(@Param('boardId') boardId: number, @Body() data: BoardMemberUpdateDto, @Res() res: Response) {
    const result = await this.boardMembersService.UpdateBoardMember(boardId, data.userIdArray);
    return res.status(HttpStatus.OK).json({
      message: '보드멤버를 업데이트 했습니다.',
      updateUserList: result.updateUserList,
      boardName: result.boardName,
    });
  }

  // 보드 멤버 찾기
  @Get('/boards/:boardId/members/:userId')
  @UseGuards(AuthGuard)
  async GetBoardMemberNameSearch(
    @Param('userId') userId: number,
    @Param('boardId') boardId: number,
    @Res() res: Response
  ) {
    const members = await this.boardMembersService.GetBoardMemberName(boardId, userId);
    return res.status(HttpStatus.OK).json({ boardMembers: members });
  }
}
