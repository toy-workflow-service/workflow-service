import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Board_Message } from 'src/_common/entities/board-message.entity';
import { Board } from 'src/_common/entities/board.entity';
import { User } from 'src/_common/entities/user.entitiy';
import { Repository } from 'typeorm';

@Injectable()
export class BoardMessagesService {
  constructor(
    @InjectRepository(Board_Message)
    private boardMessageRepository: Repository<Board_Message>,
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  //보드 메세지 조회
  async GetBoardMessages(boardId: number) {
    const boardMessages = await this.boardMessageRepository.find({ relations: ['board'] });

    return boardMessages.filter((boardMessage) => {
      return boardMessage.board.id == boardId;
    });
  }

  //보드 메세지 생성
  async PostBoardMessage(boardId: number, message: string, file_url: string, userId: number) {
    const board = await this.boardRepository.findOneBy({ id: boardId });
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!board) throw new NotFoundException('해당 보드는 존재하지 않습니다.');
    await this.boardMessageRepository.insert({ message, file_url, user, board });
  }
}
