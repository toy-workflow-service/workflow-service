import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { BoardMembersService } from './board-members.service';
import { CreateBoardMemberDto } from './create-board-member.dto';

@Controller('board-members')
export class BoardMembersController {
  constructor(private readonly boardMembersService: BoardMembersService) {}

  //보드 멤버 조회
  @Get('/boards/:boardId/members')
  async GetBoardMembers(@Param('boardId') boardId: number) {
    return await this.boardMembersService.GetBoardMembers(boardId);
  }

  //보드 멤버 초대
  @Post('/boards/:boardId/members')
  async CreateBoardMember(@Param('boardId') boardId: number, @Body() data: CreateBoardMemberDto) {
    await this.boardMembersService.CreateBoardMember(boardId, data.name);
  }

  //보드 멤버 제외
  @Delete('/boards/:boardId/members/:userId')
  async DeleteBoardMember(@Param('boardId') boardId: number, @Param('userId') userId: number) {
    await this.boardMembersService.DeleteBoardMember(boardId, userId);
  }
}
