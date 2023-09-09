import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Direct_Message } from 'src/_common/entities/direct-message.entity';
import { UserMessageRoomsService } from 'src/user-message-rooms/user-message-rooms.service';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class DirectMessagesService {
  constructor(
    @InjectRepository(Direct_Message)
    private DirectMessagesRepository: Repository<Direct_Message>,
    private userMessageRoomsService: UserMessageRoomsService
  ) {}

  async savePrivateMessage(roomId: number, userId: number, message: string): Promise<any> {
    const existMessageRoom = await this.userMessageRoomsService.findPrivateRoom(roomId);
    if (!existMessageRoom) throw new HttpException('대화 중인 상대방이 채팅 방을 나갔습니다. ', HttpStatus.NOT_FOUND);

    return await this.DirectMessagesRepository.save({
      message,
      user: { id: userId },
      user_message_room: { id: roomId },
    });
  }

  async savePrivateMessageFile(userId: number, roomId: number, fileUrl: string, originalname: string) {
    const existMessageRoom = await this.userMessageRoomsService.findPrivateRoom(roomId);
    if (!existMessageRoom) throw new HttpException('대화 중인 상대방이 채팅 방을 나갔습니다. ', HttpStatus.NOT_FOUND);

    return await this.DirectMessagesRepository.save({
      user: { id: userId },
      user_message_room: { id: roomId },
      file_url: fileUrl,
      file_original_name: originalname,
    });
  }

  async GetRoomMessages(rooms: string[]): Promise<any> {
    return Promise.all(
      rooms.map((roomId: string) => {
        return this.DirectMessagesRepository.createQueryBuilder('message')
          .innerJoinAndSelect('message.user', 'user')
          .select([
            'message.id',
            'message.user_message_room_id as room_id',
            'message.message',
            'message.file_url',
            'message.file_original_name',
            'message.created_at',
            'user.id',
            'user.name',
            'user.profile_url',
            'user.phone_number',
            'user.email',
          ])
          .where('message.user_message_room_id = :roomId ', { roomId })
          .orderBy('message.created_at')
          .getRawMany();
      })
    );
  }

  async deletePrivateMessage(messageId: number): Promise<void> {
    const existMessage = await this.DirectMessagesRepository.findOne({ where: { id: messageId } });
    if (!existMessage) throw new HttpException({ message: '해당 메시지를 찾을 수 없습니다.' }, HttpStatus.NOT_FOUND);

    await this.DirectMessagesRepository.delete({ id: messageId });
  }
}
