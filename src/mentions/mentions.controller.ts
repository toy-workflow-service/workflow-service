import { Body, Controller, Get, HttpStatus, Param, Post, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { MentionsService } from './mentions.service';
import { AuthGuard } from 'src/_common/security/auth.guard';
import {
  CreateBoardMessageMentionDto,
  CreateCommentMentionDto,
  CreateDirectMessageMentionDto,
} from 'src/_common/dtos/mention.dto';
import { GetUser } from 'src/_common/decorators/get-user.decorator';
import { AccessPayload } from 'src/_common/interfaces/access-payload.interface';

@Controller('mentions')
export class MentionsController {
  constructor(private readonly mentionsService: MentionsService) {}

  // comment mention post
  @Post('comments/:commentId')
  @UseGuards(AuthGuard)
  async CommentMention(
    @Param('commentId') commentId: number,
    @Res() res: Response,
    @Body() data: CreateCommentMentionDto,
    @GetUser() user: AccessPayload,
  ) {
    await this.mentionsService.CreateCommentMention(commentId, data, user.id);
    return res.status(HttpStatus.CREATED).json({ message: '보드에 멤버를 초대하였습니다.' });
  }

  // board mention post
  @Post('board-messages/:boardMessageId')
  @UseGuards(AuthGuard)
  async BoardMessageMention(
    @Param('boardMessageId') boardMessageId: number,
    @Res() res: Response,
    @Body() data: CreateBoardMessageMentionDto,
    @GetUser() user: AccessPayload,
  ) {
    await this.mentionsService.CreateBoardMessageMention(boardMessageId, data, user.id);
    return res.status(HttpStatus.CREATED).json({ message: '보드에 멤버를 초대하였습니다.' });
  }

  // direct message mention post
  @Post('direct-messages/:directMessageId')
  @UseGuards(AuthGuard)
  async DirectMessageMention(
    @Param('directMessageId') directMessageId: number,
    @Res() res: Response,
    @Body() data: CreateDirectMessageMentionDto,
    @GetUser() user: AccessPayload,
  ) {
    await this.mentionsService.CreateDirectMessageMention(directMessageId, data, user.id);
    return res.status(HttpStatus.CREATED).json({ message: '보드에 멤버를 초대하였습니다.' });
  }

  // mention all get
  @Get()
  @UseGuards(AuthGuard)
  async MentionAllGet(@GetUser() user: AccessPayload, @Res() res: Response) {
    const mentions = await this.mentionsService.GetMentions(user.id);
    return res.status(HttpStatus.OK).json({ mentions });
  }

  // comment mention get
  @Get('comments/:commentId')
  @UseGuards(AuthGuard)
  async CommentMentionGet(@Param('commentId') commentId: number, @GetUser() user: AccessPayload, @Res() res: Response) {
    const commentMentions = await this.mentionsService.GetCommentMentions(commentId, user.id);
    return res.status(HttpStatus.OK).json({ commentMentions });
  }

  // board message mention get
  @Get('board-messages/:boardMessageId')
  @UseGuards(AuthGuard)
  async BoardMentionGet(
    @Param('boardMessageId') boardMessageId: number,
    @GetUser() user: AccessPayload,
    @Res() res: Response,
  ) {
    const BoardMentions = await this.mentionsService.GetBoardMessageMentions(boardMessageId, user.id);
    return res.status(HttpStatus.OK).json({ BoardMentions });
  }

  // direct message mention get
  @Get('direct-messages/:directMessageId')
  @UseGuards(AuthGuard)
  async DirectMessageMentionGet(
    @Param('directMessageId') directMessageId: number,
    @GetUser() user: AccessPayload,
    @Res() res: Response,
  ) {
    const DirectMessageMentions = await this.mentionsService.GetDirectMessageMentions(directMessageId, user.id);
    return res.status(HttpStatus.OK).json({ DirectMessageMentions });
  }
}
