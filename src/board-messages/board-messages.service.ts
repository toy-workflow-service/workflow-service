import { Injectable, NotFoundException } from '@nestjs/common';
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
    private boardsService: BoardsService,
    private usersService: UsersService,
  ) {}

  //보드 메세지 조회
  async GetBoardMessages(boardId: number) {
    const boardMessages = await this.boardMessageRepository.find({ relations: ['board', 'user'] });

    const messages = boardMessages.filter((boardMessage) => {
      return boardMessage.board.id == boardId;
    });

    return messages.map((message) => {
      return {
        boardMessageId: message.id,
        boardId: message.board.id,
        userId: message.user.id,
        message: message.message,
        fileUrl: message.file_url,
        createdAt: message.created_at,
        updatedAt: message.updated_at,
      };
    });
  }

  //보드 메세지 생성
  async PostBoardMessage(boardId: number, message: string, file_url: string, userId: number) {
    const board = await this.boardsService.GetBoardById(boardId);
    const user = await this.usersService.findUserById(userId);
    if (!board) throw new NotFoundException('해당 보드는 존재하지 않습니다.');
    const mention = await this.boardMessageMentions(message, boardId);
    console.log(mention);
    await this.boardMessageRepository.insert({ message, file_url, user, board });
  }

  //보드 메세지 멘션 추출
  async boardMessageMentions(message: string, boardId: number) {
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
    return { mentions: mentionMessages, boardId };
  }
}
