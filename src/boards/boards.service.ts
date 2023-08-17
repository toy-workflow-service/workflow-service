import { Injectable } from '@nestjs/common';
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
    const findBoards = await this.boardRepository.find({ relations: ['workspace'] });

    return findBoards.filter((board) => {
      return board.workspace.id == workspaceId;
    });
  }

  //보드 상세 조회
  async GetBoardById(workspaceId: number, id: number) {
    return await this.boardRepository.findOneBy({ id });
  }

  //보드 생성
  async CreateBoard(workspaceId: number, name: string, description: string) {
    const workspace = await this.workspaceRepository.findOneBy({ id: workspaceId });

    await this.boardRepository.insert({ name, description, workspace });
  }

  //보드 수정
  async UpdateBoard(workspaceId: number, id: number, name: string, description: string) {
    await this.boardRepository.update({ id }, { name, description });
  }

  //보드 삭제
  async DeleteBoard(workspaceId: number, id: number) {
    await this.boardRepository.delete(id);
  }
}
