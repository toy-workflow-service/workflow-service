import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Res, UseGuards } from '@nestjs/common';
import { BoardMembersService } from './board-members.service';
import { Response } from 'express';
import { BoardMemberUpdateDto, CreateBoardMemberDto } from 'src/_common/dtos/board.dto';
import { AuthGuard } from 'src/_common/security/auth.guard';

@Controller('')
export class BoardMembersController {
  constructor(private readonly boardMembersService: BoardMembersService) {}

  //보드 멤버 조회
  @Get('/boards/:boardId/members')
  @UseGuards(AuthGuard)
  async GetBoardMembers(@Param('boardId') boardId: number, @Res() res: Response) {
    const members = await this.boardMembersService.GetBoardMembers(boardId);
    return res.status(HttpStatus.OK).json({ boardMembers: members });
  }

  //보드 멤버 초대
  @Post('/boards/:boardId/members')
  @UseGuards(AuthGuard)
  async CreateBoardMember(@Param('boardId') boardId: number, @Body() data: CreateBoardMemberDto, @Res() res: Response) {
    await this.boardMembersService.CreateBoardMember(boardId, data.name);
    return res.status(HttpStatus.CREATED).json({ message: '보드에 멤버를 초대하였습니다.' });
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
  async UpdateBoardMember(
    @Param('boardId') boardId: number,
    @Param('userId') userId: number,
    @Query('deleteId') deleteId: number,
    @Res() res: Response
  ) {
    await this.boardMembersService.UpdateBoardMember(boardId, userId, deleteId);
    return res.status(HttpStatus.OK).json({ message: '보드멤버를 업데이트 했습니다.' });
  }
}
