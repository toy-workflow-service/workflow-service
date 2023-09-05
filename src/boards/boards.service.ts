import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Board_Column } from 'src/_common/entities/board-column.entity';
import { Board } from 'src/_common/entities/board.entity';
import { AuditLogsService } from 'src/audit-logs/audit-logs.service';
import { WorkspacesService } from 'src/workspaces/workspaces.service';
import { Repository } from 'typeorm';

@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
    private readonly workspaceService: WorkspacesService,
    private readonly auditLogService: AuditLogsService,
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

    const boardInfo = boards.map((board) => {
      const boardMembers = board.board_members.map((boardMember) => ({
        id: boardMember.user.id,
        name: boardMember.user.name,
        email: boardMember.user.email,
        profile_url: boardMember.user.profile_url,
        phone_number: boardMember.user.phone_number,
      }));

      return {
        workspaceId: board.workspace.id,
        workspaceName: board.workspace.name,
        boardId: board.id,
        boardName: board.name,
        description: board.description,
        boardMembers: boardMembers,
        createdAt: board.created_at,
        updatedAt: board.updated_at,
      };
    });

    const boardInfos = [];
    for (let board = 0; board < boardInfo.length; board++) {
      const totalCardCount = await this.boardColumnRepository
        .createQueryBuilder('column')
        .leftJoin('column.cards', 'card')
        .where('column.board.id = :boardId', { boardId: boardInfo[board].boardId })
        .select('SUM(card.board_column IS NOT NULL) as totalCount')
        .getRawOne();

      const doneCardCount = await this.boardColumnRepository
        .createQueryBuilder('column')
        .leftJoin('column.cards', 'card')
        .where('column.board.id = :boardId', { boardId: boardInfo[board].boardId })
        .andWhere('column.name = :name', { name: 'Done' })
        .select('SUM(card.board_column IS NOT NULL) as doneCount')
        .getRawOne();

      const cardCount = { total: totalCardCount.totalCount, done: doneCardCount.doneCount };
      boardInfos.push({ ...boardInfo[board], cardCount });
    }

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
  async CreateBoard(
    workspaceId: number,
    name: string,
    description: string,
    loginUserName: string,
    loginUserId: number
  ): Promise<Object> {
    const workspace = await this.workspaceService.getWorkspaceDetail(workspaceId);
    const boardCount: any = await this.GetBoards(workspaceId);
    const hasMembership = workspace.memberships.length > 0;

    if (boardCount.length >= 3 && !hasMembership)
      throw new HttpException('무료 워크스페이스는 보드를 3개까지만 생성할 수 있습니다.', HttpStatus.BAD_REQUEST);

    const board = await this.boardRepository.insert({ name, description, workspace });
    const findBoard = await this.boardRepository.findOneBy({ id: board.raw.insertId });
    await this.boardColumnRepository.insert({ name: 'Done', sequence: 1, board: findBoard });
    const boardId = board.raw.insertId;
    await this.auditLogService.createBoardLog(workspaceId, boardId, name, loginUserId, loginUserName);

    return board;
  }

  //보드 수정
  async UpdateBoard(
    workspaceId: number,
    id: number,
    name: string,
    description: string,
    loginUserId: number,
    loginUserName: string
  ) {
    await this.boardRepository.update({ id }, { name, description });
    await this.auditLogService.updateBoardLog(workspaceId, id, name, loginUserId, loginUserName);
  }

  //보드 삭제
  async DeleteBoard(workspaceId: number, id: number, loginUserId: number, loginUserName: string) {
    const targetBoard = await this.GetBoardById(id);

    if (!targetBoard) throw new HttpException('해당 보드는 존재하지 않습니다.', HttpStatus.NOT_FOUND);

    await this.boardRepository.delete(id);
    await this.auditLogService.deleteBoardLog(workspaceId, id, targetBoard.name, loginUserId, loginUserName);
  }

  async GetJoinBoards(userId: number) {
    const joinBoards = await this.boardRepository
      .createQueryBuilder('board')
      .innerJoinAndSelect('board.board_members', 'member')
      .select(['board.id', 'board.name'])
      .where('member.user_id = :userId ', { userId })
      .getRawMany();
    return joinBoards;
  }
}
