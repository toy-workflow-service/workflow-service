import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from 'src/_common/entities/comment.entity';
import { CardsService } from 'src/cards/cards.service';

@Injectable()
export class CommentsService {
  commentMentions(comment: any): { mentions: any } | PromiseLike<{ mentions: any }> {
    throw new Error('Method not implemented.');
  }
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    private readonly cardsService: CardsService
  ) {}

  // 코멘트 조회
  async GetComments(cardId: number) {
    const findComments = await this.commentRepository.find({
      where: { card: { id: cardId } },
      relations: ['card'],
    });

    return findComments;
  }

  // 코멘트 상세 조회
  async GetCommentById(id: number) {
    return await this.commentRepository.findOneBy({ id });
  }

  // 코멘트 생성
  async CreateComment(cardId: number, userId: number, reply_id: number, comment: string) {
    const card = await this.cardsService.GetCards(cardId);
    if (!card) {
      throw new NotFoundException('컬럼을 찾을 수 없습니다.');
    }

    if (!comment) {
      throw new NotFoundException('데이터 형식이 올바르지 않습니다.');
    }

    const newComment = this.commentRepository.create({
      card: { id: cardId },
      user: { id: userId },
      comment,
      reply_id,
    });

    await this.commentRepository.save(newComment);
    return newComment;
  }

  async UpdateComment(cardId: number, id: number, userId: number, reply_id: number, comment: string) {
    const card = await this.cardsService.GetCards(cardId);
    if (!card) {
      throw new NotFoundException('컬럼을 찾을 수 없습니다.');
    }

    if (!comment) {
      throw new NotFoundException('데이터 형식이 올바르지 않습니다.');
    }

    // 코멘트를 업데이트하기 전에 해당 코멘트가 유저의 것인지 확인할 수 있는 로직을 추가할 수 있습니다.
    const existingComment = await this.commentRepository
      .createQueryBuilder('comment')
      .where('comment.id = :id', { id })
      .andWhere('comment.user_Id = :userId', { userId })
      .getOne();

    if (!existingComment) {
      console.log(userId);
      throw new NotFoundException('코멘트를 찾을 수 없거나 권한이 없습니다.');
    }

    await this.commentRepository.update(id, { comment, reply_id });
  }

  async DeleteComment(cardId: number, id: number, userId: number) {
    const existingComment = await this.commentRepository
      .createQueryBuilder('comment')
      .where('comment.id = :id', { id })
      .andWhere('comment.user_Id = :userId', { userId })
      .getOne();

    if (!existingComment) {
      console.log(userId);
      throw new NotFoundException('코멘트를 찾을 수 없거나 권한이 없습니다.');
    }

    await this.commentRepository.delete(id);
  }
}
