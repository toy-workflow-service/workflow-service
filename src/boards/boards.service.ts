import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Board } from 'src/_common/entities/board.entity';
import { Workspace } from 'src/_common/entities/workspace.entity';
import { Repository } from 'typeorm';

@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
    @InjectRepository(Workspace)
    private workspaceRepository: Repository<Workspace>,
  ) {}

  // 보드 조회
  async GetBoards(workspaceId: number) {
    const workspace = await this.workspaceRepository.findOneBy({ id: workspaceId });
    const findBoards = await this.boardRepository.find({ relations: ['workspace'] });
    if (!workspace) throw new NotFoundException('해당 워크스페이스는 존재하지 않습니다.');

    return findBoards.filter((board) => {
      return board.workspace.id == workspaceId;
    });
  }

  //보드 상세 조회
  async GetBoardById(workspaceId: number, id: number) {
    const workspace = await this.workspaceRepository.findOneBy({ id: workspaceId });
    if (!workspace) throw new NotFoundException('해당 워크스페이스는 존재하지 않습니다.');

    return await this.boardRepository.findOneBy({ id });
  }

  //보드 생성
  async CreateBoard(workspaceId: number, name: string, description: string) {
    const workspace = await this.workspaceRepository.findOneBy({ id: workspaceId });
    if (!workspace) throw new NotFoundException('해당 워크스페이스는 존재하지 않습니다.');
    if (!name || !description) throw new NotFoundException('데이터 형식이 올바르지 않습니다.');

    await this.boardRepository.insert({ name, description, workspace });
  }

  //보드 수정
  async UpdateBoard(workspaceId: number, id: number, name: string, description: string) {
    const workspace = await this.workspaceRepository.findOneBy({ id: workspaceId });
    const board = await this.boardRepository.findOneBy({ id });
    if (!workspace) throw new NotFoundException('해당 워크스페이스는 존재하지 않습니다.');
    if (!board) throw new NotFoundException('해당 보드는 존재하지 않습니다.');
    if (!name || !description) throw new NotFoundException('데이터 형식이 올바르지 않습니다.');
    await this.boardRepository.update({ id }, { name, description });
  }

  //보드 삭제
  async DeleteBoard(workspaceId: number, id: number) {
    const workspace = await this.workspaceRepository.findOneBy({ id: workspaceId });
    const board = await this.boardRepository.findOneBy({ id });
    if (!workspace) throw new NotFoundException('해당 워크스페이스는 존재하지 않습니다.');
    if (!board) throw new NotFoundException('해당 보드는 존재하지 않습니다.');
    await this.boardRepository.delete(id);
  }
}
