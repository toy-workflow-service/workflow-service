import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Card } from 'src/_common/entities/card.entity';
import { BoardColumnsService } from 'src/board-columns/board-columns.service';
import { CreateCardDto } from 'src/_common/dtos/create-card.dto';
import { UpdateCardDto } from 'src/_common/dtos/update-card.dto';
@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(Card)
    private cardRepository: Repository<Card>,
    private readonly boardColumnService: BoardColumnsService
  ) {}
  //카드 조회
  async GetCards(board_column_Id: number) {
    const findCards = await this.cardRepository.find({ relations: ['board_column'] });

    findCards.sort((a, b) => {
      return a.sequence - b.sequence;
    });
    return findCards.filter((card) => {
      return card.board_column.id == board_column_Id;
    });
  }
  //카드 상세 조회
  async GetCardById(board_column_Id: number, id: number) {
    return await this.cardRepository.findOneBy({ id });
  }
  //카드 생성
  async CreateCard(
    board_column_id: number,
    cardInfo: CreateCardDto,
    files: string[],
    fileSizes: string[],
    originalnames: string[],
    fileSize: string[],
    memberIds: string[]
  ) {
    const column = await this.boardColumnService.findOneBoardColumnById(board_column_id);
    if (!column) {
      throw new NotFoundException('컬럼을 찾을 수 없습니다.');
    }

    await this.cardRepository.insert({
      board_column: column,
      ...cardInfo,
      file_url: files,
      file_original_name: originalnames,
      file_size: fileSizes,
      members: memberIds,
    });
  }
  //카드 수정
  async UpdateCard(
    board_column_Id: number,
    id: number,
    cardInfo: UpdateCardDto,
    files: string[],
    originalnames: string[],
    filesSizes: string[],
    memberIds: string[]
  ) {
    const column = await this.boardColumnService.findOneBoardColumnById(board_column_Id); // BoardColumnService에서 컬럼 가져옴
    if (!column) {
      throw new NotFoundException('컬럼을 찾을 수 없습니다.');
    }

    await this.cardRepository.update(
      { id },
      {
        name: cardInfo.name,
        content: cardInfo.content,
        color: cardInfo.color,
        file_url: files,
        file_original_name: originalnames,
        file_size: filesSizes,
        members: memberIds,
      }
    );
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
    await this.cardRepository.update({ id: cardId }, { sequence, board_column: boardColumn });
  }
}
