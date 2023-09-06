import { Controller, Param, Post, Res, UseGuards } from '@nestjs/common';
import { UserMessageRoomsService } from './user-message-rooms.service';
import { AuthGuard } from 'src/_common/security/auth.guard';
import { GetUser } from 'src/_common/decorators/get-user.decorator';
import { AccessPayload } from 'src/_common/interfaces/access-payload.interface';

@Controller('userMessageRooms')
export class UserMessageRoomsController {
  constructor(private readonly userMessageRoomsService: UserMessageRoomsService) {}

  @Post(':userId')
  @UseGuards(AuthGuard)
  async createUserMessageRoom(@Param('userId') userId: number, @GetUser() user: AccessPayload, @Res() res: Response) {
    console.log(userId, user);
  }
}
