import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { BoardMessagesService } from './board-messages.service';
import { GetUser } from 'src/_common/decorators/get-user.decorator';
import { AccessPayload } from 'src/_common/interfaces/access-payload.interface';
import { MulterRequest } from 'src/_common/interfaces/multer-request.interface';
import { Response } from 'express';
import { AuthGuard } from 'src/_common/security/auth.guard';
import { BoardMembersService } from 'src/board-members/board-members.service';
import { BoardsService } from 'src/boards/boards.service';

@Controller('boardMessages')
@UseGuards(AuthGuard)
export class BoardMessagesController {
  constructor(
    private readonly boardMessagesService: BoardMessagesService,
    private readonly boardsMemberService: BoardMembersService,
    private readonly boardsService: BoardsService
  ) {}

  //보드 메세지 조회
  @Get(':boardId')
  @UseGuards(AuthGuard)
  async GetBoardMessages(@Param('boardId') boardId: number, @GetUser() user: AccessPayload, @Res() res: Response) {
    const joinBoards = await this.boardsService.GetJoinBoards(user.id);

    joinBoards.sort((a, b) => {
      if (a.board_id / 1 === boardId) {
        return -1; // a가 boardId 일치하면 a를 앞으로 이동
      } else if (b.board_id / 1 === boardId) {
        return 1; // b가 boardId 일치하면 b를 앞으로 이동
      } else {
        return 0; // 나머지는 순서를 그대로 유지
      }
    });

    const boardMessageResults = await this.boardMessagesService.GetBoardMessages(joinBoards);
    const boardMembers = await this.boardsMemberService.FindBoardMembers(joinBoards);

    return res.status(HttpStatus.OK).json({
      boardMessageResults,
      boardMembers,
      userId: user.id,
      userName: user.name,
      userProfileUrl: user.profile_url,
    });
  }

  //보드 메세지 저장
  @Post(':boardId')
  @UseGuards(AuthGuard)
  async SaveBoardMessage(
    @Param('boardId') boardId: number,
    @GetUser() user: AccessPayload,
    @Body('message') message: string,
    @Res() res: Response
  ): Promise<Object> {
    const result = await this.boardMessagesService.SaveBoardMessage(boardId, user.id, message);
    return res.status(HttpStatus.OK).json({ messageId: result.id });
  }

  @Post(':boardId/upload')
  async UploadFileMessage(
    @Param('boardId') boardId: number,
    @Req() req: MulterRequest,
    @GetUser() user: AccessPayload,
    @Body('originalname') originalname: string,
    @Res() res: Response
  ): Promise<Object> {
    const fileUrl = req.file ? req.file.location : null;
    if (!fileUrl) throw new HttpException({ message: '파일 업로드에 실패했습니다. ' }, HttpStatus.BAD_REQUEST);

    const result = await this.boardMessagesService.SaveBoardFile(user.id, boardId, fileUrl, originalname);
    return res.status(HttpStatus.OK).json({ fileUrl, date: result.created_at, messageId: result.id });
  }

  @Delete(':messageId')
  @UseGuards(AuthGuard)
  async deleteMessage(@Param('messageId') messageId: number, @Res() res: Response): Promise<object> {
    await this.boardMessagesService.deleteMessage(messageId);
    return res.status(HttpStatus.OK).json({ message: '메시지를 삭제했습니다. ' });
  }
}
