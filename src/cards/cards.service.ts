import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Card } from 'src/_common/entities/card.entity';
import { BoardColumnsService } from 'src/board-columns/board-columns.service';

@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(Card)
    private cardRepository: Repository<Card>,
    private readonly boardColumnService: BoardColumnsService
  ) {}

  //카드 조회
  async GetCards(board_column_Id: number) {
    const boardColumn = await this.boardColumnService.findOneBoardColumnById(board_column_Id);
    const findCards = await this.cardRepository.find({ relations: ['board_column'] });
    if (!boardColumn) throw new NotFoundException('해당 칼럼은 존재하지 않습니다.');

    const cards = findCards.filter((card) => {
      return card.board_column.id == board_column_Id;
    });

    cards.sort((a, b) => {
      return a.sequence - b.sequence;
    });

    return cards.map((card) => {
      return {
        board_column_Id: card.board_column.id,
        cardId: card.id,
        cardName: card.name,
        sequence: card.sequence,
        createdAt: card.created_at,
        updatedAt: card.updated_at,
      };
    });
  }

  //카드 상세 조회
  async GetCardById(board_column_id: number, id: number) {
    return await this.cardRepository.findOne({ where: { board_column: { id: board_column_id }, id } });
  }

  //카드 생성
  async CreateCard(
    board_column_id: number,
    name: string,
    content: string,
    file_url: string,
    sequence: number,
    color: string,
    members: number[]
  ) {
    const column = await this.boardColumnService.findOneBoardColumnById(board_column_id);
    if (!column) {
      throw new NotFoundException('컬럼을 찾을 수 없습니다.');
    }

    await this.cardRepository.insert({ board_column: column, name, content, file_url, sequence, color, members });
  }

  //카드 수정
  async UpdateCard(board_column_Id: number, id: number, name: string, content: string, file_url: string) {
    const column = await this.boardColumnService.findOneBoardColumnById(board_column_Id); // BoardColumnService에서 컬럼 가져옴
    if (!column) {
      throw new NotFoundException('컬럼을 찾을 수 없습니다.');
    }

    if (!name || !content) {
      throw new NotFoundException('데이터 형식이 올바르지 않습니다.');
    }

    await this.cardRepository.update(id, { name, content, file_url });
  }

  //카드삭제
  async DeleteCard(board_column_Id: number, id: number) {
    await this.cardRepository.delete(id);
  }

  //카드 시퀀스 수정
  async UpdateCardSequence(board_column_Id: number, cardId: number, sequence: number) {
    const boardColumn = await this.boardColumnService.findOneBoardColumnById(board_column_Id);
    const card = await this.cardRepository.findOneBy({ id: cardId });
    if (!boardColumn) throw new NotFoundException('해당 보드는 존재하지 않습니다.');
    if (!card) throw new NotFoundException('해당 칼럼은 존재하지 않습니다.');
    await this.cardRepository.update({ id: cardId }, { sequence });
  }
}
