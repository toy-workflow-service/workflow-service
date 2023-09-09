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

  async createUserMessageRoom(loginUserId: any, userId: any) {
    const messageRoom = await this.userMessageRoomsRepository
      .createQueryBuilder('room')
      .select(['room.id as id'])
      .where('room.sender_id = :userId and room.receiver_id = :loginUserId', { userId, loginUserId })
      .orWhere('room.sender_id = :loginUserId and room.receiver_id = :userId', { userId, loginUserId })
      .getRawOne();

    if (!messageRoom) {
      const roomDAO = {
        sender: loginUserId,
        receiver: userId,
      };
      return await this.userMessageRoomsRepository.save(roomDAO);
    }

    return messageRoom;
  }

  async getUserMessageRoom(userId: number) {
    return await this.userMessageRoomsRepository
      .createQueryBuilder('room')
      .innerJoinAndSelect('room.sender', 'sender')
      .innerJoinAndSelect('room.receiver', 'receiver')
      .select([
        'room.id',
        'sender.id',
        'sender.name',
        'sender.email',
        'sender.phone_number',
        'sender.profile_url',
        'receiver.id',
        'receiver.name',
        'receiver.email',
        'receiver.phone_number',
        'receiver.profile_url',
      ])
      .where('room.sender_id=:userId', { userId })
      .orWhere('room.receiver_id=:userId', { userId })
      .getRawMany();
  }

  async deleteUserMessageRoom(roomId: number): Promise<void> {
    await this.userMessageRoomsRepository.delete({ id: roomId });
  }

  async findPrivateRoom(roomId: number): Promise<any> {
    return this.userMessageRoomsRepository.findOne({ where: { id: roomId } });
  }
}
