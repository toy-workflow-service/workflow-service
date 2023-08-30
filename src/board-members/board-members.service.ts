import { Injectable, NotAcceptableException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Board_Member } from 'src/_common/entities/board-member.entity';
import { BoardsService } from 'src/boards/boards.service';
import { UsersService } from 'src/users/users.service';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class BoardMembersService {
  constructor(
    @InjectRepository(Board_Member)
    private boardMemberRepository: Repository<Board_Member>,
    private usersService: UsersService,
    private boardsService: BoardsService
  ) {}

  //보드 멤버 조회
  async GetBoardMembers(boardId: number) {
    const boardMembers = await this.boardMemberRepository.find({ relations: ['board', 'user'] });
    const board = await this.boardsService.GetBoardById(boardId);
    if (!board) throw new NotFoundException('해당 보드는 존재하지 않습니다.');

    const members = boardMembers.filter((boardMember) => {
      return boardMember.board.id == boardId;
    });

    return members.map((member) => {
      return {
        boardMemberId: member.id,
        userId: member.user.id,
        name: member.user.name,
        profileUrl: member.user.profile_url,
        phoneNumber: member.user.phone_number,
      };
    });
  }

  //보드 멤버 초대
  async CreateBoardMember(boardId: number, name: string) {
    const user = await this.usersService.findUserByName(name);
    const board = await this.boardsService.GetBoardById(boardId);
    const boardMembers = await this.boardMemberRepository.find({ relations: ['user', 'board'] });
    const boardMember = boardMembers.find((member) => {
      if (member.user.id == user.id && member.board.id == boardId) {
        return member;
      }
    });
    if (!user) throw new NotFoundException('해당 유저는 존재하지 않습니다.');
    if (!board) throw new NotFoundException('해당 보드는 존재하지 않습니다.');
    if (boardMember) throw new NotAcceptableException('이미 초대된 멤버입니다.');

    await this.boardMemberRepository.insert({ user, board });
  }

  //보드 멤버 제외
  async DeleteBoardMember(boardId: number, userId: number) {
    const user = await this.usersService.findUserById(userId);
    const board = await this.boardsService.GetBoardById(boardId);
    const boardMembers = await this.boardMemberRepository.find({ relations: ['user', 'board'] });
    const boardMember = boardMembers.find((member) => {
      if (member.user.id == userId && member.board.id == boardId) {
        return member;
      }
    });
    if (!user) throw new NotFoundException('해당 유저는 존재하지 않습니다.');
    if (!board) throw new NotFoundException('해당 보드는 존재하지 않습니다.');
    if (!boardMember) throw new NotFoundException('해당 보드에서 존재하지 않는 멤버입니다.');

    await this.boardMemberRepository.delete({ id: boardMember.id });
  }

  //보드 멤버 업데이트
  async UpdateBoardMember(boardId: number, userId: number, deleteUserId: number) {
    const user = await this.usersService.findUserById(userId);
    const board = await this.boardsService.GetBoardById(boardId);
    const boardMembers = await this.boardMemberRepository.find({ relations: ['user', 'board'] });
    boardMembers.filter((member) => {
      return boardId == member.board.id;
    });
    const undefindUser = boardMembers.find((member) => {
      return userId != member.user.id;
    });
    const findUser = boardMembers.find((member) => {
      return deleteUserId == member.user.id;
    });
    if (!user) throw new NotFoundException('해당 유저는 존재하지 않습니다.');
    if (!board) throw new NotFoundException('해당 보드는 존재하지 않습니다.');

    const entityManager = this.boardMemberRepository.manager;
    try {
      await entityManager.transaction(async (transactionEntityManager: EntityManager) => {
        if (undefindUser) {
          const newBoardMembers = this.boardMemberRepository.create({ board, user });
          console.log(newBoardMembers);
          await transactionEntityManager.save(Board_Member, newBoardMembers);

          const deleteBoardMember = this.boardMemberRepository.delete({ id: findUser.id });
          console.log(deleteBoardMember);
          await transactionEntityManager.remove(deleteBoardMember);
        }
      });
      return { result: true };
    } catch (err) {
      console.error(err);
    }
  }

  //보드 멤버 이름 조회
  async GetBoardMemberName(boardId: number, userId: number) {
    const boardMembers = await this.boardMemberRepository.find({ relations: ['board', 'user'] });
    const members = boardMembers.filter((boardMember) => {
      if (boardMember.board.id == boardId && boardMember.user.id == userId) {
        return boardMember;
      }
    });
    return members.map((member) => {
      return {
        boardMemberId: member.id,
        userId: member.user.id,
        name: member.user.name,
        profileUrl: member.user.profile_url,
        phoneNumber: member.user.phone_number,
      };
    });
  }
}
