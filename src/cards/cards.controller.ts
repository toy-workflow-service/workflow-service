import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Delete,
  Query,
  UseGuards,
  Put,
  Req,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { CardsService } from './cards.service';
import { CreateCardDto } from '../_common/dtos/create-card.dto';
import { UpdateCardDto } from '../_common/dtos/update-card.dto';
import { AuthGuard } from 'src/_common/security/auth.guard';
import { UpdateCardSequenceDto } from 'src/_common/dtos/update-card-sequence.dto';
import { GetUser } from 'src/_common/decorators/get-user.decorator';
import { AccessPayload } from 'src/_common/interfaces/access-payload.interface';
import { MulterRequest } from 'src/_common/interfaces/multer-request.interface';
import { Response } from 'express';

@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}
  //카드 조회
  @Get()
  async GetCards(@Query('board_column_Id') board_column_Id: number) {
    return await this.cardsService.GetCards(board_column_Id);
  }
  //카드 상세 조회
  @Get('/:cardId')
  async GetCardById(@Query('board_column_Id') board_column_Id: number, @Param('cardId') id: number) {
    return await this.cardsService.GetCardById(board_column_Id, id);
  }
  //카드 생성
  @Post()
  async CreateCard(
    @Query('board_column_Id') boardColumnId: number,
    @Body() data: CreateCardDto,
    @Body('members') memberIds: string[],
    @Req() req: MulterRequest,
    @Body('originalnames') originalnames: string[],
    @Body('fileSize') fileSize: string[],
    @Res() res: Response
  ) {
    const files: any = req.files;
    let fileArray = [];
    let fileSizeArray = [];
    if (files) {
      files.forEach((file) => {
        fileArray.push(file.location);
        fileSizeArray.push(file.size);
      });
    }
    await this.cardsService.CreateCard(boardColumnId, data, fileArray, fileSizeArray, originalnames, memberIds);

    return res.status(HttpStatus.OK).json({ message: '카드를 생성하였습니다.' });
  }
  //카드 수정
  @Patch('/:cardId')
  async UpdateCard(
    @Param('cardId') id: number,
    @Query('board_column_Id') board_column_Id: number,
    @Body() data: UpdateCardDto,
    @Body('members') memberIds: string[],
    @Body('originalnames') originalnames: string[],
    @Body('alreadyFiles') alreadyFiles: string[],
    @Body('alreadyFileNames') alreadyFileNames: string[],
    @Body('fileSize') fileSize: string[],
    @Body('alreadyfileSize') alreadyfileSize: string[],
    @Body('alreadyFileCount') alreadyFileCount: number,
    @Req() req: MulterRequest,
    @Res() res: Response
  ) {
    const files: any = req.files;
    let fileArray = [];
    let fileName = [];
    let filesSizes = [];
    console.log(files, alreadyFiles);
    if (files[0]) {
      files.forEach((file) => {
        fileArray.push(file.location);
      });
      if (files.length > 1) {
        originalnames.forEach((name) => {
          fileName.push(name);
        });
        fileSize.forEach((size) => {
          filesSizes.push(size);
        });
      } else {
        fileName.push(originalnames);
        filesSizes.push(fileSize);
      }
    }
    if (alreadyFiles) {
      if (alreadyFileCount > 1) {
        alreadyFiles.forEach((file) => {
          fileArray.push(file);
        });
        alreadyFileNames.forEach((name) => {
          fileName.push(name);
        });
        alreadyfileSize.forEach((size) => {
          filesSizes.push(size);
        });
      } else {
        const name = alreadyFileNames;
        fileArray.push(alreadyFiles);
        fileName.push(name);
        filesSizes.push(alreadyfileSize);
      }
    }
    console.log(fileSize, alreadyfileSize);
    console.log(filesSizes);

    await this.cardsService.UpdateCard(board_column_Id, id, data, fileArray, fileName, filesSizes, memberIds);
    return res.status(HttpStatus.OK).json({ message: '카드를 수정하였습니다.' });
  }
  //카드 삭제
  @Delete('/:cardId')
  @UseGuards(AuthGuard)
  async DeleteCard(@Query('board_column_Id') columnId: number, @Param('cardId') id: number) {
    return await this.cardsService.DeleteCard(columnId, id);
  }

  //카드 시퀀스 수정
  @Put('/:cardId/sequence')
  @UseGuards(AuthGuard)
  async UpdateCardSequence(
    @Query('board_column_Id') board_column_Id: number,
    @Param('cardId') cardId: number,
    @Body() data: UpdateCardSequenceDto
  ) {
    await this.cardsService.UpdateCardSequence(board_column_Id, cardId, data.sequence);
  }
}
