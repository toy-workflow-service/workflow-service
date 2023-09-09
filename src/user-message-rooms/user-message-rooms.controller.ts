import { Controller, Delete, Get, HttpStatus, Param, Post, Res, UseGuards } from '@nestjs/common';
import { UserMessageRoomsService } from './user-message-rooms.service';
import { AuthGuard } from 'src/_common/security/auth.guard';
import { GetUser } from 'src/_common/decorators/get-user.decorator';
import { AccessPayload } from 'src/_common/interfaces/access-payload.interface';
import { Response } from 'express';
import { DirectMessagesService } from 'src/direct-messages/direct-messages.service';

@Controller('userMessageRooms')
@UseGuards(AuthGuard)
export class UserMessageRoomsController {
  constructor(
    private readonly userMessageRoomsService: UserMessageRoomsService,
    private readonly directMessagesService: DirectMessagesService
  ) {}

  @Post(':userId')
  async createUserMessageRoom(
    @Param('userId') userId: number,
    @GetUser() user: AccessPayload,
    @Res() res: Response
  ): Promise<Object> {
    const result = await this.userMessageRoomsService.createUserMessageRoom(user.id, userId);

    return res.status(HttpStatus.OK).json({ roomId: result.id });
  }

  @Get(':roomId')
  async getUserMessageRooms(
    @Param('roomId') roomId: number,
    @GetUser() user: AccessPayload,
    @Res() res: Response
  ): Promise<Object> {
    let roomArray = [];
    const rooms = await this.userMessageRoomsService.getUserMessageRoom(user.id);

    rooms.sort((a, b) => {
      if (a.room_id / 1 === roomId) {
        return -1; // a가 boardId 일치하면 a를 앞으로 이동
      } else if (b.room_id / 1 === roomId) {
        return 1; // b가 boardId 일치하면 b를 앞으로 이동
      } else {
        return 0; // 나머지는 순서를 그대로 유지
      }
    });

    if (!rooms) res.status(HttpStatus.OK).json({ rooms });
    rooms.forEach((room) => {
      roomArray.push(room.room_id);
    });
    const messages = await this.directMessagesService.GetRoomMessages(roomArray);

    return res.status(HttpStatus.OK).json({ rooms, messages, userName: user.name });
  }

  @Delete(':roomId')
  async deleteUserMessageRoom(@Param('roomId') roomId: number, @Res() res: Response): Promise<Object> {
    await this.userMessageRoomsService.deleteUserMessageRoom(roomId);
    return res.status(HttpStatus.OK).json({ message: '대화방이 정상적으로 삭제 되었습니다. ' });
  }
}
