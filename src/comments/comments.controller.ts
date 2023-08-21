import { Body, Controller, Get, Param, Post, Patch, Delete } from '@nestjs/common';
import { CommentsService } from 'src/comments/comments.service';
import { CreateCommentDto } from '../_common/dtos/create-comment.dto';
import { UpdateCommentDto } from '../_common/dtos/update-comment.dto';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  //코멘트 조회
  @Get('/:cardId')
  async GetComments(@Param('cardId') cardId: number) {
    return await this.commentsService.GetComments(cardId);
  }

  //코멘트 조회
  @Get('/:cardId/:commentId')
  async GetCommentById(@Param('cardId') cardId: number, @Param(':commentId') id: number) {
    return await this.commentsService.GetCommentById(cardId, id);
  }

  //카드 생성
  @Post('/:cardId')
  async CreateComment(@Param('/:cardId') cardId: number, @Body() data: CreateCommentDto) {
    return await this.commentsService.CreateComment(cardId, data.reply_id, data.comment);
  }

  //카드 수정
  @Patch('/:cardId/:commentId')
  async UpdateCard(@Param('cardId') cardId: number, @Param('commentId') id: number, @Body() data: UpdateCommentDto) {
    return await this.commentsService.UpdateComment(cardId, id, data.reply_id, data.comment);
  }

  //카드 삭제
  @Delete('/:cardId/:commentId')
  async DeleteCard(@Param('cardId') cardId: number, @Param('commentId') id: number) {
    return await this.commentsService.DeleteComment(cardId, id);
  }
}
