import { Injectable, NotAcceptableException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Board_Member } from 'src/_common/entities/board-member.entity';
import { BoardsService } from 'src/boards/boards.service';
import { CardsService } from 'src/cards/cards.service';
import { UsersService } from 'src/users/users.service';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class BoardMembersService {
  constructor(
    @InjectRepository(Board_Member)
    private boardMemberRepository: Repository<Board_Member>,
    private readonly usersService: UsersService,
    private readonly boardsService: BoardsService,
    private readonly cardsService: CardsService
  ) {}

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
  async CreateBoardMember(boardId: number, userId: number) {
    const user = await this.usersService.findUserById(userId);
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

    // if (!user.workspace_members[0].participation)
    //   throw new HttpException('워크스페이스에 참여된 멤버가 아닙니다.', HttpStatus.BAD_REQUEST);
    const result = await this.boardMemberRepository.save({ user: { id: user.id }, board: { id: board.id } });
    return { userId: result.user.id, boardName: board.name };
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
  async UpdateBoardMember(boardId: number, users: number[]) {
    let updateUserList = [];
    const board = await this.boardsService.GetBoardById(boardId);
    const boardMembers = await this.boardMemberRepository.find({ relations: ['user', 'board'] });
    const boardMember = boardMembers.filter((member) => {
      return boardId == member.board.id;
    });
    const userArray = [];
    for (const i in boardMember) {
      userArray.push(boardMember[i].user.id);
    }
    const deleteUsers = boardMember.filter((x) => !users.includes(x.user.id));
    const updateUsers = users.filter((x) => !userArray.includes(x));
    if (!board) throw new NotFoundException('해당 보드는 존재하지 않습니다.');
    const entityManager = this.boardMemberRepository.manager;
    try {
      await entityManager.transaction(async (transactionEntityManager: EntityManager) => {
        if (updateUsers.length > 0) {
          for (const i in updateUsers) {
            const user = await this.usersService.findUserById(updateUsers[i]);
            if (!user) throw new NotFoundException('해당 유저는 존재하지 않습니다.');
            const newBoardMembers = this.boardMemberRepository.create({ board, user });
            const result = await transactionEntityManager.save(Board_Member, newBoardMembers);
            updateUserList.push(result.user.id);
          }
        }
        if (deleteUsers.length > 0) {
          for (const i in deleteUsers) {
            await transactionEntityManager.delete(Board_Member, { id: deleteUsers[i].id });
            await this.cardsService.DeleteCardMembers(boardId, deleteUsers[i].user.id);
          }
        }
      });
      return { updateUserList, boardName: board.name };
    } catch (err) {
      console.error(err);
    }
  }

  async FindBoardMembers(joinBoards: any) {
    return Promise.all(
      joinBoards.map(async (board: any) => {
        const boardMembers = await this.boardMemberRepository
          .createQueryBuilder('member')
          .innerJoinAndSelect('member.user', 'user')
          .innerJoinAndSelect('member.board', 'board')
          .select([
            'user.id',
            'user.name',
            'user.email',
            'user.phone_number',
            'user.profile_url',
            'board.id',
            'board.name',
          ])
          .where('member.board_id = :boardId ', { boardId: board.board_id })
          .getRawMany();

        return boardMembers;
      })
    );
  }
}
