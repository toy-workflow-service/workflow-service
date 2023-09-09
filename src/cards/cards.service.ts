import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Card } from 'src/_common/entities/card.entity';
import { BoardColumnsService } from 'src/board-columns/board-columns.service';
import { CreateCardDto } from 'src/_common/dtos/create-card.dto';
import { UpdateCardDto } from 'src/_common/dtos/update-card.dto';
import { AuditLogsService } from 'src/audit-logs/audit-logs.service';
import { BoardsService } from 'src/boards/boards.service';
import { WorkspacesService } from 'src/workspaces/workspaces.service';
import { MembershipsService } from 'src/memberships/memberships.service';
import { UsersService } from 'src/users/users.service';
@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(Card)
    private cardRepository: Repository<Card>,
    private readonly boardColumnService: BoardColumnsService,
    private readonly boardService: BoardsService,
    private readonly auditLogService: AuditLogsService,
    private readonly workspaceService: WorkspacesService,
    private readonly membershipService: MembershipsService,
    private readonly usersService: UsersService
  ) {}
  //카드 조회
  async GetCards(board_column_Id: number) {
    let findCards = await this.cardRepository.find({ relations: ['board_column'] });

    findCards.sort((a, b) => {
      return a.sequence - b.sequence;
    });
    findCards = findCards.filter((card) => {
      return card.board_column.id == board_column_Id;
    });

    const totalCard = [];
    for (let i = 0; i < findCards.length; i++) {
      const members = [];
      if (findCards[i].members) {
        for (let j = 0; j < findCards[i].members.length; j++) {
          const member = await this.usersService.findUserById(Number(findCards[i].members[j]));
          members.push(member);
        }
      }
      totalCard.push({ cardInfo: findCards[i], cardMembers: members });
    }
    return totalCard;
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
    memberIds: string[],
    loginUserId: number,
    loginUserName: string
  ) {
    const column = await this.boardColumnService.findOneBoardColumnById(board_column_id);
    if (!column) {
      throw new NotFoundException('컬럼을 찾을 수 없습니다.');
    }
    const board = await this.boardService.GetBoardById(column.board.id);
    const checkStorage = await this.workspaceService.caculateFileSizes(board.workspace.id);
    const checkMembership = await this.membershipService.checkMembership(board.workspace.id);

    let inputFileSize = 0;
    if (fileSizes.length) {
      fileSizes.forEach((size) => {
        inputFileSize += parseInt(size);
      });
    }

    if (checkMembership) {
      const limitInGb = 10;
      if (fileSizes.length && limitInGb <= (checkStorage + inputFileSize) / (1024 * 1024)) {
        throw new HttpException('워크스페이스 제한용량이 초과되어 업로드가 불가능합니다.', HttpStatus.BAD_REQUEST);
      }
    } else {
      const limitInMb = 100;
      if (fileSizes.length && limitInMb <= (checkStorage + inputFileSize) / 1024) {
        throw new HttpException('워크스페이스 제한용량이 초과되어 업로드가 불가능합니다.', HttpStatus.BAD_REQUEST);
      }
    }

    const result = await this.cardRepository.save({
      board_column: column,
      ...cardInfo,
      file_url: files,
      file_original_name: originalnames,
      file_size: fileSizes,
      members: memberIds,
    });
    await this.auditLogService.createCardLog(board.workspace.id, cardInfo.name, loginUserId, loginUserName);

    return { boardId: board.id, cardName: result.name };
  }

  //카드 수정
  async UpdateCard(
    board_column_id: number,
    id: number,
    cardInfo: UpdateCardDto,
    files: string[],
    originalnames: string[],
    fileSizes: string[],
    memberIds: string[],
    loginUserId: number,
    loginUserName: string
  ) {
    let updateUserList = [];
    const column = await this.boardColumnService.findOneBoardColumnById(board_column_id); // BoardColumnService에서 컬럼 가져옴
    if (!column) {
      throw new NotFoundException('컬럼을 찾을 수 없습니다.');
    }

    const board = await this.boardService.GetBoardById(column.board.id);
    const existCard = await this.GetCardById(board_column_id, id);
    const checkStorage = await this.workspaceService.caculateFileSizes(board.workspace.id);
    const checkMembership = await this.membershipService.checkMembership(board.workspace.id);

    let inputFileSize = 0;
    if (fileSizes.length) {
      fileSizes.forEach((size) => {
        inputFileSize += parseInt(size);
      });
    }

    if (checkMembership) {
      const limitInGb = 10;
      if (fileSizes.length && limitInGb <= (checkStorage + inputFileSize) / (1024 * 1024)) {
        throw new HttpException('워크스페이스 제한용량이 초과되어 업로드가 불가능합니다.', HttpStatus.BAD_REQUEST);
      }
    } else {
      const limitInMb = 100;
      if (fileSizes.length && limitInMb <= (checkStorage + inputFileSize) / 1024) {
        throw new HttpException('워크스페이스 제한용량이 초과되어 업로드가 불가능합니다.', HttpStatus.BAD_REQUEST);
      }
    }

    if (!memberIds) {
      memberIds = [];
    } else {
      if (existCard.members) {
        if (memberIds.length === 1) {
          memberIds = [memberIds[0]];
        }
        updateUserList = [...existCard.members];
        updateUserList = memberIds.map((userId) => {
          if (!updateUserList.includes(userId)) return userId;
        });
        updateUserList = updateUserList.filter((userId) => userId);
      } else {
        updateUserList = [...memberIds];
      }
    }
    if (files.length === 0) {
      originalnames = null;
      files = null;
      fileSizes = null;
    }
    await this.cardRepository.update(
      { id },
      {
        name: cardInfo.name,
        content: cardInfo.content,
        color: cardInfo.color,
        file_url: files,
        file_original_name: originalnames,
        file_size: fileSizes,
        members: memberIds,
      }
    );

    await this.auditLogService.updateCardLog(
      board.workspace.id,
      existCard.name,
      cardInfo.name,
      loginUserId,
      loginUserName
    );
    return { updateUserList, boardId: board.id, cardName: existCard.name };
  }
  //카드삭제
  async DeleteCard(board_column_id: number, id: number, loginUserId: number, loginUserName: string) {
    const column = await this.boardColumnService.findOneBoardColumnById(board_column_id);
    const board = await this.boardService.GetBoardById(column.board.id);
    const existCard = await this.GetCardById(board_column_id, id);
    if (!existCard) throw new NotFoundException('해당 카드는 존재하지 않습니다.');

    await this.cardRepository.delete(id);
    await this.auditLogService.deleteCardLog(board.workspace.id, existCard.name, loginUserId, loginUserName);
  }

  //카드 시퀀스 수정
  async UpdateCardSequence(board_column_id: number, cardId: number, sequence: number) {
    const boardColumn = await this.boardColumnService.findOneBoardColumnById(board_column_id);
    const card = await this.cardRepository.findOneBy({ id: cardId });
    if (!boardColumn) throw new NotFoundException('해당 보드는 존재하지 않습니다.');
    if (!card) throw new NotFoundException('해당 칼럼은 존재하지 않습니다.');
    await this.cardRepository.update({ id: cardId }, { sequence, board_column: boardColumn });
  }

  //보드에서 멤버 삭제시 해당하는 카드에서도 멤버 삭제. -> 업데이트임
  async DeleteCardMembers(boardId: number, userId: number) {
    const columns = await this.boardColumnService.GetBoardColumns(boardId);
    columns.columnInfos.map(async (column) => {
      const findCards = await this.cardRepository.find({ relations: ['board_column'] });
      const cards = findCards.filter((card) => {
        return card.board_column.id == column.columnId;
      });

      cards.map(async (card) => {
        const member = [];
        if (typeof card.members == 'string') {
          member.push(card.members);
          for (let i: number = 0; i < member.length; i++) {
            if (member[i] == userId) {
              member.splice(i, 1);
            }
          }
        } else if (card.members != null) {
          card.members.forEach((m) => {
            if (m != String(userId)) {
              member.push(m);
            }
          });
        }
        const cardId = card.id;
        await this.cardRepository.update({ id: cardId }, { members: member });
      });
    });
  }
}
