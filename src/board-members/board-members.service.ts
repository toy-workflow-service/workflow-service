import { Injectable, NotAcceptableException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Board_Member } from 'src/_common/entities/board-member.entity';
import { Board } from 'src/_common/entities/board.entity';
import { User } from 'src/_common/entities/user.entitiy';
import { Repository } from 'typeorm';

@Injectable()
export class BoardMembersService {
  constructor(
    @InjectRepository(Board_Member)
    private boardMemberRepository: Repository<Board_Member>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
  ) {}

  //보드 멤버 조회
  async GetBoardMembers(boardId: number) {
    const boardMembers = await this.boardMemberRepository.find({ relations: ['board'] });

    return boardMembers.filter((boardMember) => {
      return boardMember.board.id == boardId;
    });
  }

  //보드 멤버 초대
  async CreateBoardMember(boardId: number, name: string) {
    const user = await this.userRepository.findOneBy({ name });
    const board = await this.boardRepository.findOneBy({ id: boardId });
    const boardMember = await this.boardMemberRepository.findBy({ user, board });
    if (!user) throw new NotFoundException('해당 유저는 존재하지 않습니다.');
    if (!board) throw new NotFoundException('해당 보드는 존재하지 않습니다.');
    if (boardMember) throw new NotAcceptableException('이미 초대된 멤버입니다.');

    await this.boardMemberRepository.insert({ user, board });
  }

  //보드 멤버 제외
  async DeleteBoardMember(boardId: number, userId: number) {
    const user = await this.userRepository.findOneBy({ id: userId });
    const board = await this.boardRepository.findOneBy({ id: boardId });
    const boardMember = await this.boardMemberRepository.findOneBy({ user, board });
    if (!boardMember) throw new NotFoundException('해당 보드에서 존재하지 않는 멤버입니다.');

    await this.boardMemberRepository.delete({ id: boardMember.id });
  }
}
