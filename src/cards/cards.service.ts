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
  async GetCards(columnId: number) {
    const findCards = await this.cardRepository.find({ relations: ['board_column'] });

    return findCards.filter((card) => {
      return card.board_column.id == columnId;
    });
  }

  //카드 상세 조회
  async GetCardById(columnId: number, id: number) {
    return await this.cardRepository.findOneBy({ id });
  }

  //카드 생성
  async CreateCard(
    columnId: number,
    name: string,
    content: string,
    file_url: string,
    sequence: number,
    color: string,
    members: number[]
  ) {
    const column = await this.boardColumnService.GetBoardColumns(columnId);
    if (!column) {
      throw new NotFoundException('컬럼을 찾을 수 없습니다.');
    }

    if (!name || !content) {
      throw new NotFoundException('데이터 형식이 올바르지 않습니다.');
    }

    const newCard = this.cardRepository.create({
      name,
      content,
      file_url,
      sequence,
      column,
      color,
      members: members, // 가정: 멤버들의 정보를 저장
    });

    await this.cardRepository.save(newCard);
    return newCard;
  }

  async UpdateCard(columnId: number, id: number, name: string, content: string, file_url: string, sequence: number) {
    const column = await this.boardColumnService.GetBoardColumns(columnId); // BoardColumnService에서 컬럼 가져옴
    if (!column) {
      throw new NotFoundException('컬럼을 찾을 수 없습니다.');
    }

    if (!name || !content) {
      throw new NotFoundException('데이터 형식이 올바르지 않습니다.');
    }

    await this.cardRepository.update(id, { name, content, file_url, sequence, column });
  }

  //카드삭제
  async DeleteCard(columnId: number, id: number) {
    await this.cardRepository.delete(id);
  }
}
