import { Body, Controller, Get, Param, Post, Patch, Delete, Query, UseGuards } from '@nestjs/common';
import { CommentsService } from 'src/comments/comments.service';
import { CreateCommentDto } from '../_common/dtos/create-comment.dto';
import { UpdateCommentDto } from '../_common/dtos/update-comment.dto';
import { AuthGuard } from 'src/_common/security/auth.guard';
import { GetUser } from 'src/_common/decorators/get-user.decorator';
import { AccessPayload } from 'src/_common/interfaces/access-payload.interface';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  //코멘트 조회
  @Get()
  async GetComments(@Query('cardId') cardId: number) {
    return await this.commentsService.GetComments(cardId);
  }

  //코멘트 상세 조회
  @Get('/:commentId')
  async GetCommentById(@Query('cardId') cardId: number, @Param('commentId') id: number) {
    return await this.commentsService.GetCommentById(id);
  }

  //코멘트 생성
  @Post()
  @UseGuards(AuthGuard)
  async CreateComment(
    @Query('boardColumnId') board_column_id: number,
    @Query('cardId') cardId: number,
    @Body() data: CreateCommentDto,
    @GetUser() user: AccessPayload
  ) {
    return await this.commentsService.CreateComment(board_column_id, cardId, user.id, data.reply_id, data.comment);
  }

  //코멘트 수정
  @Patch('/:commentId')
  @UseGuards(AuthGuard)
  async UpdateCard(
    @Query('boardColumnId') board_column_id: number,
    @Query('cardId') cardId: number,
    @Param('commentId') id: number,
    @Body() data: UpdateCommentDto,
    @GetUser() user: AccessPayload
  ) {
    return await this.commentsService.UpdateComment(board_column_id, cardId, id, user.id, data.reply_id, data.comment);
  }

  //코멘트 삭제
  @Delete('/:commentId')
  @UseGuards(AuthGuard)
  async DeleteCard(@Query('cardId') cardId: number, @Param('commentId') id: number, @GetUser() user: AccessPayload) {
    return await this.commentsService.DeleteComment(cardId, id, user.id);
  }
}
