import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Board_Column } from 'src/_common/entities/board-column.entity';
import { Board } from 'src/_common/entities/board.entity';
import { Repository } from 'typeorm';

@Injectable()
export class BoardColumnsService {
  constructor(
    @InjectRepository(Board_Column)
    private boardColumnRepository: Repository<Board_Column>,
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
  ) {}

  //보드 칼럼 조회
  async GetBoardColumns(boardId: number) {
    const boardColumns = await this.boardColumnRepository.find({ relations: ['board'] });

    return boardColumns.filter((boardColumn) => {
      return boardColumn.board.id == boardId;
    });
  }

  //보드 칼럼 생성
  async PostBoardColumn(boardId: number, name: string, sequence: number) {
    const board = await this.boardRepository.findOneBy({ id: boardId });
    if (!board) throw new NotFoundException('해당 보드는 존재하지 않습니다.');
    await this.boardColumnRepository.insert({ name, sequence, board });
  }

  //보드 칼럼 이름 수정
  async UpdateBoardColumnName(boardId: number, columnId: number, name: string) {
    const board = await this.boardRepository.findOneBy({ id: boardId });
    if (!board) throw new NotFoundException('해당 보드는 존재하지 않습니다.');
    await this.boardColumnRepository.update({ id: columnId }, { name });
  }

  //보드 칼럼 순서 수정
  async UpdateBoardColumnSequence(boardId: number, columnId: number, sequence: number) {
    const board = await this.boardRepository.findOneBy({ id: boardId });
    if (!board) throw new NotFoundException('해당 보드는 존재하지 않습니다.');
    await this.boardColumnRepository.update({ id: columnId }, { sequence });
  }

  //보드 칼럼 삭제
  async DeleteBoardColumn(boardId: number, columnId: number) {
    const board = await this.boardRepository.findOneBy({ id: boardId });
    if (!board) throw new NotFoundException('해당 보드는 존재하지 않습니다.');
    await this.boardColumnRepository.delete({ id: columnId });
  }
}
