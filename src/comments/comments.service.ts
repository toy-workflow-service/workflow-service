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

  async GetComments(cardId: number) {
    const findComments = await this.commentRepository.find({
      where: { card: { id: cardId } },
      relations: ['card', 'user'], // 'user' 관계를 추가하여 사용자 정보를 가져옵니다.
    });

    // 선택적으로 사용자 엔터티의 원하는 속성만 추출
    const commentsWithUser = findComments.map((comment) => ({
      id: comment.id,
      reply_id: comment.reply_id,
      comment: comment.comment,
      created_at: comment.created_at,
      updated_at: comment.updated_at,
      user: {
        id: comment.user.id,
        name: comment.user.name,
      },
      card: {
        // 카드 관련 데이터도 필요에 따라 추출
        id: comment.card.id,
        // 다른 카드 관련 데이터도 필요에 따라 추가할 수 있습니다.
      },
    }));

    return commentsWithUser;
  }

  async GetCommentById(id: number) {
    const findComment = await this.commentRepository.findOne({
      where: { id },
      relations: ['card', 'user'], // 'user' 관계를 추가하여 작성자 정보를 가져옵니다.
    });

    if (!findComment) {
      // 코멘트가 없으면 null을 반환하거나 적절한 에러 처리를 수행합니다.
      throw new Error('댓글을 찾을 수 없습니다.');
    }

    const commentDetailWithUser = {
      id: findComment.id,
      reply_id: findComment.reply_id,
      comment: findComment.comment,
      created_at: findComment.created_at,
      updated_at: findComment.updated_at,
      user: {
        id: findComment.user.id,
        name: findComment.user.name,
      },
    };

    return commentDetailWithUser;
  }

  // 코멘트 생성
  async CreateComment(board_column_Id: number, cardId: number, userId: number, reply_id: number, comment: string) {
    const card = await this.cardsService.GetCardById(board_column_Id, cardId);
    if (!card) {
      throw new NotFoundException('카드을 찾을 수 없습니다.');
    }

    if (!comment) {
      throw new NotFoundException('데이터 형식이 올바르지 않습니다.');
    }

    let parentComment: Comment | null = null;
    if (reply_id) {
      // reply_id와 동일한 코멘트 id를 가진 댓글을 찾습니다.
      parentComment = await this.commentRepository.findOneBy({ id: reply_id });
      if (!parentComment) {
        throw new NotFoundException('대댓글을 생성할 댓글을 찾을 수 없습니다.');
      }
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

  async UpdateComment(
    board_column_Id: number,
    cardId: number,
    id: number,
    userId: number,
    reply_id: number,
    comment: string
  ) {
    const card = await this.cardsService.GetCardById(board_column_Id, cardId);
    if (!card) {
      throw new NotFoundException('카드를 찾을 수 없습니다.');
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
      throw new NotFoundException('코멘트를 찾을 수 없거나 권한이 없습니다.');
    }

    await this.commentRepository.delete(id);
  }
}
