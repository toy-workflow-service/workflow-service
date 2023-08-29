import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Board_Column } from 'src/_common/entities/board-column.entity';
import { IResult } from 'src/_common/interfaces/result.interface';
import { Repository } from 'typeorm';

@Injectable()
export class BoardColumnsService {
  constructor(
    @InjectRepository(Board_Column)
    private boardColumnRepository: Repository<Board_Column>
  ) {}

  //보드 칼럼 조회
  async GetBoardColumns(boardId: number) {
    const boardColumns = await this.boardColumnRepository.find({ relations: ['board'] });

    const columns = boardColumns.filter((boardColumn) => {
      return boardColumn.board.id == boardId;
    });

    columns.sort((a, b) => {
      return a.sequence - b.sequence;
    });

    return columns.map((column) => {
      return {
        boardId: column.board.id,
        columnId: column.id,
        columnName: column.name,
        sequence: column.sequence,
        createdAt: column.created_at,
        updatedAt: column.updated_at,
      };
    });
  }

  //보드 칼럼 상세 조회
  async findOneBoardColumnById(id: number) {
    const existBoardColumn = await this.boardColumnRepository.findOne({ where: { id }, relations: ['board'] });

    if (!existBoardColumn) throw new NotFoundException('해당 칼럼이 존재하지 않습니다.');

    return existBoardColumn;
  }

  //보드 칼럼 생성
  async PostBoardColumn(boardId: number, name: string, sequence: number): Promise<IResult> {
    console.log(boardId);
    const existColumn = await this.boardColumnRepository.findOne({ where: { board: { id: boardId }, name } });

    if (existColumn) throw new ConflictException('이미 존재하는 칼럼입니다.');

    const newColumn = this.boardColumnRepository.create({
      name,
      sequence,
      board: { id: boardId },
    });

    await this.boardColumnRepository.save(newColumn);

    return { result: true };
  }

  //보드 칼럼 이름 수정
  async UpdateBoardColumnName(boardId: number, columnId: number, name: string) {
    const column = await this.boardColumnRepository.findOne({ where: { board: { id: boardId }, id: columnId } });
    if (!column) throw new NotFoundException('해당 칼럼은 존재하지 않습니다.');
    await this.boardColumnRepository.update({ id: columnId }, { name });
  }

  //보드 칼럼 순서 수정
  async UpdateBoardColumnSequence(boardId: number, columnId: number, sequence: number) {
    const column = await this.boardColumnRepository.findOne({ where: { board: { id: boardId }, id: columnId } });
    if (!column) throw new NotFoundException('해당 칼럼은 존재하지 않습니다.');
    await this.boardColumnRepository.update({ id: columnId }, { sequence });
  }

  //보드 칼럼 삭제
  async DeleteBoardColumn(boardId: number, columnId: number) {
    const column = await this.boardColumnRepository.findOne({ where: { board: { id: boardId }, id: columnId } });
    if (!column) throw new NotFoundException('해당 칼럼은 존재하지 않습니다.');
    await this.boardColumnRepository.delete({ id: columnId });
  }

  // 워크스페이스가 보유한 카드개수 조회
  async countWorkspaceCards(workspaceId: number): Promise<Number> {
    const totalCardCount = await this.boardColumnRepository
      .createQueryBuilder('column')
      .innerJoin('column.board', 'board')
      .leftJoin('column.cards', 'card')
      .where('board.workspace = :workspaceId', { workspaceId })
      .select('SUM(card.board_column IS NOT NULL) as totalCount')
      .getRawOne();

    return totalCardCount;
  }
}
