import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User_Message_Room } from 'src/_common/entities/user-message-room.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserMessageRoomsService {
  constructor(
    @InjectRepository(User_Message_Room)
    private userMessageRoomsRepository: Repository<User_Message_Room>
  ) {}

  async createUserMessageRoom(userId: number, loginUserId: number) {}
}
