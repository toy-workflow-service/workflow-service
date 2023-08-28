import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Board_Column } from 'src/_common/entities/board-column.entity';
import { Board } from 'src/_common/entities/board.entity';
import { WorkspacesService } from 'src/workspaces/workspaces.service';
import { Repository } from 'typeorm';

@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
    private readonly workspaceService: WorkspacesService,
    @InjectRepository(Board_Column)
    private boardColumnRepository: Repository<Board_Column>
  ) {}

  // 보드 조회
  async GetBoards(workspaceId: number) {
    const workspace = await this.workspaceService.getWorkspaceDetail(workspaceId);
    const findBoards = await this.boardRepository.find({ relations: ['workspace', 'board_members.user'] });
    if (!workspace) throw new NotFoundException('해당 워크스페이스는 존재하지 않습니다.');

    const boards = findBoards.filter((board) => {
      return board.workspace.id == workspaceId;
    });

    const boardInfos = boards.map((board) => {
      const boardMembers = board.board_members.map((boardMember) => ({
        id: boardMember.user.id,
        name: boardMember.user.name,
        email: boardMember.user.email,
        profile_url: boardMember.user.profile_url,
        phone_number: boardMember.user.phone_number,
      }));

      return {
        workspaceId: board.workspace.id,
        boardId: board.id,
        boardName: board.name,
        description: board.description,
        boardMembers: boardMembers,
        createdAt: board.created_at,
        updatedAt: board.updated_at,
      };
    });

    return boardInfos;
  }

  //보드 상세 조회
  async GetBoard(workspaceId: number, id: number) {
    return await this.boardRepository.findOne({ where: { id }, relations: ['workspace'] });
  }

  async GetBoardById(id: number) {
    return await this.boardRepository.findOne({ where: { id }, relations: ['workspace'] });
  }

  //보드 생성
  async CreateBoard(workspaceId: number, name: string, description: string) {
    const workspace = await this.workspaceService.getWorkspaceDetail(workspaceId);
    const board = await this.boardRepository.insert({ name, description, workspace });
    const findBoard = await this.boardRepository.findOneBy({ id: board.raw.insertId });
    await this.boardColumnRepository.insert({ name: 'Done', sequence: 1, board: findBoard });
  }

  //보드 수정
  async UpdateBoard(workspaceId: number, id: number, name: string, description: string) {
    await this.boardRepository.update({ id }, { name, description });
  }

  //보드 삭제
  async DeleteBoard(workspaceId: number, id: number) {
    await this.boardRepository.delete(id);
  }

  async getJoinBoards(userId: number) {
    const joinBoards = await this.boardRepository
      .createQueryBuilder('board')
      .innerJoinAndSelect('board.board_members', 'member')
      .select(['board.id', 'board.name'])
      .where('member.user_id = :userId ', { userId })
      .getRawMany();
    return joinBoards;
  }
}
