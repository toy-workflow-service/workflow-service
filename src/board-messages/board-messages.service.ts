import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Board_Message } from 'src/_common/entities/board-message.entity';
import { BoardsService } from 'src/boards/boards.service';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';

@Injectable()
export class BoardMessagesService {
  constructor(
    @InjectRepository(Board_Message)
    private boardMessageRepository: Repository<Board_Message>,
    private usersService: UsersService,
    private boardsService: BoardsService
  ) {}

  //보드 메세지 조회
  async GetBoardMessages(joinBoards: any): Promise<any> {
    return Promise.all(
      joinBoards.map((board: any) => {
        return this.boardMessageRepository
          .createQueryBuilder('message')
          .innerJoinAndSelect('message.user', 'user')
          .innerJoinAndSelect('message.board', 'board')
          .select([
            'message.id',
            'message.board_id',
            'message.message',
            'message.file_url',
            'message.file_original_name',
            'message.created_at',
            'board.name',
            'user.id',
            'user.name',
            'user.profile_url',
            'user.phone_number',
            'user.email',
          ])
          .where('message.board_id = :boardId ', { boardId: board.board_id })
          .orderBy('message.created_at')
          .getRawMany();
      })
    );
  }

  //보드 메세지 생성
  async SaveBoardMessage(boardId: number, userId: number, message: string) {
    const existBoard = await this.boardsService.GetBoard(boardId);
    if (!existBoard) throw new HttpException('해당 보드가 삭제되었습니다. ', HttpStatus.NOT_FOUND);
    return await this.boardMessageRepository.save({ message, user: { id: userId }, board: { id: boardId } });
  }

  async SaveBoardFile(userId: number, boardId: number, fileUrl: string, originalname: string) {
    const existBoard = await this.boardsService.GetBoard(boardId);
    if (!existBoard) throw new HttpException('해당 보드가 삭제되었습니다. ', HttpStatus.NOT_FOUND);
    return await this.boardMessageRepository.save({
      user: { id: userId },
      board: { id: boardId },
      file_url: fileUrl,
      file_original_name: originalname,
    });
  }

  async deleteMessage(messageId: number): Promise<void> {
    const existMessage = await this.boardMessageRepository.findOne({ where: { id: messageId } });
    if (!existMessage) throw new HttpException({ message: '해당 메시지를 찾을 수 없습니다.' }, HttpStatus.NOT_FOUND);

    await this.boardMessageRepository.delete({ id: messageId });
  }

  //보드 메세지 멘션 추출
  async boardMessageMentions(message: string) {
    const messages: any = message.split(' ');
    const mentionMessages: any = [];
    for (let i: number = 0; i < messages.length; i++) {
      if (messages[i].search('@') > -1) {
        if (messages[i].length > 1) {
          const mention = messages[i].replace('@', '');
          mentionMessages.push(mention);
        }
      }
    }
    for (let i: number = 0; i < mentionMessages.length; i++) {
      const user = await this.usersService.findUserByName(mentionMessages[i]);
      if (!user) {
        mentionMessages.splice(i);
      }
    }
    return { mentions: mentionMessages };
  }

  // 보드 메세지 id로 조회
  async boardMessageById(boardMessageId: number) {
    const boardMessages = await this.boardMessageRepository.findOneBy({ id: boardMessageId });

    return boardMessages;
  }
}
