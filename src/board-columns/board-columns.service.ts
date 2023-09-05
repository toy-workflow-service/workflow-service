import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Board_Column } from 'src/_common/entities/board-column.entity';
import { BoardsService } from 'src/boards/boards.service';
import { Repository } from 'typeorm';

@Injectable()
export class BoardColumnsService {
  constructor(
    @InjectRepository(Board_Column)
    private boardColumnRepository: Repository<Board_Column>,
    private boardsService: BoardsService
  ) {}

  //보드 칼럼 조회
  async GetBoardColumns(boardId: number) {
    const board = await this.boardsService.GetBoardById(boardId);
    const boardColumns = await this.boardColumnRepository.find({ relations: ['board'] });
    if (!board) throw new NotFoundException('해당 보드는 존재하지 않습니다.');
    const columns = boardColumns.filter((boardColumn) => {
      return boardColumn.board.id == boardId;
    });
    columns.sort((a, b) => {
      return a.sequence - b.sequence;
    });
    return columns.map((column) => {
      return {
        boardId: column.board.id,
        boardName: column.board.name,
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
    return await this.boardColumnRepository.findOne({ where: { id }, relations: ['board'] });
  }

  //보드 칼럼 생성
  async PostBoardColumn(boardId: number, name: string, sequence: number) {
    const column = await this.boardColumnRepository.find({ relations: ['board'] });
    const isDone = column.find((b) => {
      if (b.board.id == boardId && 'Done' == name) {
        return b;
      }
    });
    if (isDone) throw new BadRequestException('Done은 더이상 추가할 수 없습니다.');
    const board = await this.boardsService.GetBoardById(boardId);
    await this.boardColumnRepository.insert({ name, sequence, board });
  }

  //보드 칼럼 이름 수정
  async UpdateBoardColumnName(boardId: number, columnId: number, name: string) {
    const board = await this.boardsService.GetBoardById(boardId);
    const column = await this.boardColumnRepository.findOneBy({ id: columnId });
    if (!board) throw new NotFoundException('해당 보드는 존재하지 않습니다.');
    if (!column) throw new NotFoundException('해당 칼럼은 존재하지 않습니다.');
    await this.boardColumnRepository.update({ id: columnId }, { name });
  }

  //보드 칼럼 순서 수정
  async UpdateBoardColumnSequence(boardId: number, columnId: number, sequence: number) {
    const board = await this.boardsService.GetBoardById(boardId);
    const column = await this.boardColumnRepository.findOneBy({ id: columnId });
    if (!board) throw new NotFoundException('해당 보드는 존재하지 않습니다.');
    if (!column) throw new NotFoundException('해당 칼럼은 존재하지 않습니다.');
    await this.boardColumnRepository.update({ id: columnId }, { sequence });
  }

  //보드 칼럼 삭제
  async DeleteBoardColumn(boardId: number, columnId: number) {
    const board = await this.boardsService.GetBoardById(boardId);
    const column = await this.boardColumnRepository.findOneBy({ id: columnId });
    if (!board) throw new NotFoundException('해당 보드는 존재하지 않습니다.');
    if (!column) throw new NotFoundException('해당 칼럼은 존재하지 않습니다.');
    await this.boardColumnRepository.delete({ id: columnId });
  }

  // 워크스페이스가 보유한 카드개수 조회
  async countWorkspaceCards(workspaceId: number): Promise<Number> {
    const totalCardCount = await this.boardColumnRepository
      .createQueryBuilder('column')
      .innerJoin('column.board', 'board')
      .innerJoin('column.cards', 'card')
      .where('board.workspace = :workspaceId', { workspaceId })
      .select('SUM(card.board_column IS NOT NULL) as totalCount')
      .getRawOne();

    return totalCardCount;
  }
}
