import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from 'src/_common/entities/comment.entity';
import { CardsService } from 'src/cards/cards.service';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    private readonly cardsService: CardsService
  ) {}

  //코멘트 조회
  async GetComments(cardId: number) {
    const findComments = await this.commentRepository.find({ relations: ['card'] });

    return findComments.filter((comment) => {
      return comment.card.id == cardId;
    });
  }

  //코멘트 상세 조회
  async GetCommentById(cardId: number, id: number) {
    return await this.commentRepository.findOneBy({ id });
  }

  //코멘트 생성
  async CreateComment(cardId: number, reply_id: number, comment: string) {
    const card = await this.cardsService.GetCards(cardId);
    if (!card) {
      throw new NotFoundException('컬럼을 찾을 수 없습니다.');
    }

    if (!comment) {
      throw new NotFoundException('데이터 형식이 올바르지 않습니다.');
    }

    const newComment = this.commentRepository.create({
      comment,
      reply_id,
    });

    await this.commentRepository.save(newComment);
    return newComment;
  }

  async UpdateComment(cardId: number, id: number, reply_id: number, comment: string) {
    const card = await this.cardsService.GetCards(cardId);
    if (!card) {
      throw new NotFoundException('컬럼을 찾을 수 없습니다.');
    }

    if (!comment) {
      throw new NotFoundException('데이터 형식이 올바르지 않습니다.');
    }

    await this.commentRepository.update(id, { comment, reply_id });
  }

  //코멘트 삭제
  async DeleteComment(cardId: number, id: number) {
    await this.commentRepository.delete(id);
  }
}
