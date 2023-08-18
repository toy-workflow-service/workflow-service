import { Body, Controller, Get, Param, Post, Request } from '@nestjs/common';
import { BoardMessagesService } from './board-messages.service';
import { CreateBoardMessageDto } from 'src/_common/dtos/create-board-message.dto';

@Controller('board-messages')
export class BoardMessagesController {
  constructor(private readonly boardMessagesService: BoardMessagesService) {}

  //보드 메세지 조회
  @Get('/message/board/:boardId')
  async GetBoardMessages(@Param('boardId') boardId: number) {
    return await this.boardMessagesService.GetBoardMessages(boardId);
  }

  //보드 메세지 생성
  @Post('/message/board/:boardId')
  async PostBoardMessage(
    @Param('boardId') boardId: number,
    @Body() data: CreateBoardMessageDto,
    @Request() req: Request,
  ) {
    await this.boardMessagesService.PostBoardMessage(boardId, data.message, data.file_url, req);
  }
}
