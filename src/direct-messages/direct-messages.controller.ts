import { Body, Controller, Delete, HttpException, HttpStatus, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { DirectMessagesService } from './direct-messages.service';
import { AuthGuard } from 'src/_common/security/auth.guard';
import { Response } from 'express';
import { GetUser } from 'src/_common/decorators/get-user.decorator';
import { AccessPayload } from 'src/_common/interfaces/access-payload.interface';
import { MulterRequest } from 'src/_common/interfaces/multer-request.interface';

@Controller('directMessages')
@UseGuards(AuthGuard)
export class DirectMessagesController {
  constructor(private readonly directMessagesService: DirectMessagesService) {}

  //보드 메세지 저장
  @Post(':roomId')
  async SaveBoardMessage(
    @Param('roomId') roomId: number,
    @GetUser() user: AccessPayload,
    @Body('message') message: string,
    @Res() res: Response
  ): Promise<Object> {
    const result = await this.directMessagesService.savePrivateMessage(roomId, user.id, message);
    return res.status(HttpStatus.OK).json({ messageId: result.id });
  }

  @Post(':roomId/upload')
  async UploadFileMessage(
    @Param('roomId') roomId: number,
    @Req() req: MulterRequest,
    @GetUser() user: AccessPayload,
    @Body('originalname') originalname: string,
    @Res() res: Response
  ): Promise<Object> {
    const fileUrl = req.file ? req.file.location : null;
    if (!fileUrl) throw new HttpException({ message: '파일 업로드에 실패했습니다. ' }, HttpStatus.BAD_REQUEST);

    const result = await this.directMessagesService.savePrivateMessageFile(user.id, roomId, fileUrl, originalname);
    return res.status(HttpStatus.OK).json({
      fileUrl,
      date: result.created_at,
      messageId: result.id,
    });
  }

  @Delete(':messageId')
  async deletePrivateMessage(@Param('messageId') messageId: number, @Res() res: Response): Promise<object> {
    await this.directMessagesService.deletePrivateMessage(messageId);
    return res.status(HttpStatus.OK).json({ message: '메시지를 삭제했습니다. ' });
  }
}
