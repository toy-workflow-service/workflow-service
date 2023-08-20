import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Board } from 'src/_common/entities/board.entity';
import { WorkspacesService } from 'src/workspaces/workspaces.service';
import { Repository } from 'typeorm';

@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
    private readonly workspaceService: WorkspacesService
  ) {}

  // 보드 조회
  async GetBoards(workspaceId: number) {
    const workspace = await this.workspaceService.getWorkspaceDetail(workspaceId);
    const findBoards = await this.boardRepository.find({ relations: ['workspace'] });
    if (!workspace) throw new NotFoundException('해당 워크스페이스는 존재하지 않습니다.');

    const boards = findBoards.filter((board) => {
      return board.workspace.id == workspaceId;
    });
    return boards.map((board) => {
      return {
        workspaceId: board.workspace.id,
        boardId: board.id,
        boardName: board.name,
        createdAt: board.created_at,
        updatedAt: board.updated_at,
      };
    });
  }

  //보드 상세 조회
  async GetBoard(workspaceId: number, id: number) {
    const workspace = await this.workspaceService.getWorkspaceDetail(workspaceId);
    if (!workspace) throw new NotFoundException('해당 워크스페이스는 존재하지 않습니다.');

    return await this.boardRepository.findOne({ where: { id }, relations: ['workspace'] });
  }

  async GetBoardById(id: number) {
    return await this.boardRepository.findOne({ where: { id }, relations: ['workspace'] });
  }

  //보드 생성
  async CreateBoard(workspaceId: number, name: string, description: string) {
    const workspace = await this.workspaceService.getWorkspaceDetail(workspaceId);
    if (!workspace) throw new NotFoundException('해당 워크스페이스는 존재하지 않습니다.');

    await this.boardRepository.insert({ name, description, workspace });
  }

  //보드 수정
  async UpdateBoard(workspaceId: number, id: number, name: string, description: string) {
    const workspace = await this.workspaceService.getWorkspaceDetail(workspaceId);
    const board = await this.boardRepository.findOneBy({ id });
    if (!workspace) throw new NotFoundException('해당 워크스페이스는 존재하지 않습니다.');
    if (!board) throw new NotFoundException('해당 보드는 존재하지 않습니다.');
    await this.boardRepository.update({ id }, { name, description });
  }

  //보드 삭제
  async DeleteBoard(workspaceId: number, id: number) {
    const workspace = await this.workspaceService.getWorkspaceDetail(workspaceId);
    const board = await this.boardRepository.findOneBy({ id });
    if (!workspace) throw new NotFoundException('해당 워크스페이스는 존재하지 않습니다.');
    if (!board) throw new NotFoundException('해당 보드는 존재하지 않습니다.');
    await this.boardRepository.delete(id);
  }
}
