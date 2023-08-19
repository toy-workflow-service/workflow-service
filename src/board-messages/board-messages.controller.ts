import { Body, Controller, Get, HttpStatus, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { BoardMessagesService } from './board-messages.service';
import { GetUser } from 'src/_common/decorators/get-user.decorator';
import { AccessPayload } from 'src/_common/interfaces/access-payload.interface';
import { MulterRequest } from 'src/_common/interfaces/multer-request.interface';
import { Response } from 'express';
import { CreateBoardMessageDto } from 'src/_common/dtos/board.dto';
import { AuthGuard } from 'src/_common/security/auth.guard';

@Controller('board-messages')
@UseGuards(AuthGuard)
export class BoardMessagesController {
  constructor(private readonly boardMessagesService: BoardMessagesService) {}

  //보드 메세지 조회
  @Get('/board/:boardId')
  @UseGuards(AuthGuard)
  async GetBoardMessages(@Param('boardId') boardId: number, @Res() res: Response) {
    const boardMessages = await this.boardMessagesService.GetBoardMessages(boardId);

    return res.status(HttpStatus.OK).json({ boardMessages });
  }

  //보드 메세지 생성
  @Post('/board/:boardId')
  @UseGuards(AuthGuard)
  async PostBoardMessage(
    @Param('boardId') boardId: number,
    @Body() data: CreateBoardMessageDto,
    @Req() req: MulterRequest,
    @GetUser() user: AccessPayload,
    @Res() res: Response,
  ) {
    const fileUrl = req.file ? req.file.location : null;
    await this.boardMessagesService.PostBoardMessage(boardId, data.message, fileUrl, user.id);

    return res.status(HttpStatus.CREATED).json({ message: '보드 메세지를 생성하였습니다.' });
  }
}
