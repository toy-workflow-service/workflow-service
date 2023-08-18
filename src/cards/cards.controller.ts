import { Body, Controller, Get, Param, Post, Patch, Delete } from '@nestjs/common';
import { CardsService } from './cards.service';
import { CreateCardDto } from '../_common/dtos/create-card.dto';
import { UpdateCardDto } from '../_common/dtos/update-card.dto';

@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  //카드 조회
  @Get('/:columnId')
  async GetCards(@Param('columnId') columnId: number) {
    return await this.cardsService.GetCards(columnId);
  }

  //카드 상세 조회
  @Get('/:columnId/:cardId')
  async GetCardById(@Param('columnId') columnId: number, @Param('cardId') id: number) {
    return await this.cardsService.GetCardById(columnId, id);
  }

  //카드 생성
  @Post('/:columnId')
  async CreateCard(@Param('columnId') columnId: number, @Body() data: CreateCardDto) {
    return await this.cardsService.CreateCard(
      columnId,
      data.name,
      data.content,
      data.file_url,
      data.sequence,
      data.color,
      data.members
    );
  }

  //카드 수정
  @Patch('/:columnId/:cardId')
  async UpdateCard(@Param('columnId') columnId: number, @Param('cardId') id: number, @Body() data: UpdateCardDto) {
    return await this.cardsService.UpdateCard(columnId, id, data.name, data.content, data.file_url, data.sequence);
  }

  //카드 삭제
  @Delete('/:columnId/:cardId')
  async DeleteCard(@Param('columnId') columnId: number, @Param('cardId') id: number) {
    return await this.cardsService.DeleteCard(columnId, id);
  }
}
