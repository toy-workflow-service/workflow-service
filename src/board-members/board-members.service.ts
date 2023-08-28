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
  async UpdateBoardMember(boardId: number, users: string[]) {
    const board = await this.boardsService.GetBoardById(boardId);
    const boardMembers = await this.boardMemberRepository.find({ relations: ['user', 'board'] });
    const boardMember = boardMembers.filter((member) => {
      return boardId == member.board.id;
    });
    const userArray = [];
    for (const i in boardMember) {
      userArray.push(boardMember[i].user.name);
    }
    const deleteUsers = boardMember.filter((x) => !users.includes(x.user.name));
    const updateUsers = users.filter((x) => !userArray.includes(x));
    console.log('board-member: ', users);
    if (!board) throw new NotFoundException('해당 보드는 존재하지 않습니다.');

    const entityManager = this.boardMemberRepository.manager;
    try {
      await entityManager.transaction(async (transactionEntityManager: EntityManager) => {
        if (updateUsers.length > 0) {
          for (const i in updateUsers) {
            const user = await this.usersService.findUserByName(updateUsers[i]);
            if (!user) throw new NotFoundException('해당 유저는 존재하지 않습니다.');
            const newBoardMembers = this.boardMemberRepository.create({ board, user });
            console.log(newBoardMembers);
            await transactionEntityManager.save(Board_Member, newBoardMembers);
          }
        }
        if (deleteUsers.length > 0) {
          for (const i in deleteUsers) {
            const deleteBoardMember = await transactionEntityManager.delete(Board_Member, { id: deleteUsers[i].id });
            console.log(deleteBoardMember);
          }
        }
      });
      return { result: true };
    } catch (err) {
      console.error(err);
    }
  }
}
