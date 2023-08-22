import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Mention } from 'src/_common/entities/mention.entity';
import { BoardMessagesService } from 'src/board-messages/board-messages.service';
import { CommentsService } from 'src/comments/comments.service';
import { DirectMessagesService } from 'src/direct-messages/direct-messages.service';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';

@Injectable()
export class MentionsService {
  constructor(
    @InjectRepository(Mention)
    private mentionRepository: Repository<Mention>,
    private commentsService: CommentsService,
    private boardMessagesService: BoardMessagesService,
    private directMessagesService: DirectMessagesService,
    private usersService: UsersService,
  ) {}

  // comment mention 생성
  async CreateCommentMention(commentId: number, data: any, userId: number) {
    const { mentions } = await this.commentsService.commentMentions(data.comment);
    const comment = await this.commentsService.commentById(commentId);
    const sendUser = await this.usersService.findUserById(userId);
    if (!comment) {
      throw new NotFoundException('존재하지 않는 댓글 입니다.');
    } else if (!mentions) {
      throw new NotFoundException('이름이 존재하지 않습니다.');
    }

    for (let i: number = 0; i < mentions.length; i++) {
      const reseiveUser = await this.usersService.findUserByName(mentions[i]);
      if (reseiveUser) {
        this.mentionRepository.insert({
          send_id: sendUser,
          receive_id: reseiveUser,
          board_message: null,
          comment: comment,
          direct_message: null,
        });
      }
    }
  }

  // board message mention 생성
  async CreateBoardMessageMention(boardMessageId: number, data: any, userId: number) {
    const { mentions } = await this.boardMessagesService.boardMessageMentions(data.message);
    const boardMessage = await this.boardMessagesService.boardMessageById(boardMessageId);
    const sendUser = await this.usersService.findUserById(userId);
    if (!boardMessage) {
      throw new NotFoundException('존재하지 않는 보드 메세지 입니다.');
    } else if (!mentions) {
      throw new NotFoundException('이름이 존재하지 않습니다.');
    }

    for (let i: number = 0; i < mentions.length; i++) {
      const reseiveUser = await this.usersService.findUserByName(mentions[i]);
      if (reseiveUser) {
        this.mentionRepository.insert({
          send_id: sendUser,
          receive_id: reseiveUser,
          board_message: boardMessage,
          comment: null,
          direct_message: null,
        });
      }
    }
  }

  // direct message mention 생성
  async CreateDirectMessageMention(directMessageId: number, data: any, userId: number) {
    const { mentions } = await this.commentsService.directMessageMentions(data.comment);
    const directMessage = await this.directMessagesService.directMessageById(directMessageId);
    const sendUser = await this.usersService.findUserById(userId);
    if (!directMessage) {
      throw new NotFoundException('존재하지 않는 메세지 입니다.');
    } else if (!mentions) {
      throw new NotFoundException('이름이 존재하지 않습니다.');
    }

    for (let i: number = 0; i < mentions.length; i++) {
      const reseiveUser = await this.usersService.findUserByName(mentions[i]);
      if (reseiveUser) {
        this.mentionRepository.insert({
          send_id: sendUser,
          receive_id: reseiveUser,
          board_message: null,
          comment: null,
          direct_message: directMessage,
        });
      }
    }
  }

  // mention all get
  async GetMentions(userId: number) {
    const mentions = await this.mentionRepository.find({
      relations: ['send_id', 'receive_id', 'comment', 'board_message', 'direct_message'],
    });

    mentions.filter((data) => {
      return data.receive_id.id == userId;
    });

    return mentions.map((data) => {
      return {
        mentionId: data.id,
        sendId: data.send_id.id,
        sender: data.send_id.name,
        directMessageId: data.direct_message.id,
        boardMessageId: data.board_message.id,
        commentId: data.comment.id,
      };
    });
  }

  // comment mention get
  async GetCommentMentions(commentId: number, userId: number) {
    const mentions = await this.mentionRepository.find({ relations: ['send_id', 'receive_id', 'comment'] });
    mentions.filter((data) => {
      if (data.comment.id == commentId && data.receive_id.id == userId) {
        return data;
      }
    });

    return mentions.map((data) => {
      return {
        mentionId: data.id,
        sendId: data.send_id.id,
        sender: data.send_id.name,
        commentId: data.comment.id,
      };
    });
  }

  // board message mention get
  async GetBoardMessageMentions(boardMessageId: number, userId: number) {
    const mentions = await this.mentionRepository.find({ relations: ['send_id', 'receive_id', 'board_message'] });
    mentions.filter((data) => {
      if (data.board_message.id == boardMessageId && data.receive_id.id == userId) {
        return data;
      }
    });

    return mentions.map((data) => {
      return {
        mentionId: data.id,
        sendId: data.send_id.id,
        sender: data.send_id.name,
        boardMessageId: data.board_message.id,
      };
    });
  }

  // direct message mention get
  async GetDirectMessageMentions(directMessageId: number, userId: number) {
    const mentions = await this.mentionRepository.find({ relations: ['send_id', 'receive_id', 'direct_message'] });
    mentions.filter((data) => {
      if (data.direct_message.id == directMessageId && data.receive_id.id == userId) {
        return data;
      }
    });

    return mentions.map((data) => {
      return {
        mentionId: data.id,
        sendId: data.send_id.id,
        sender: data.send_id.name,
        directMessageId: data.direct_message.id,
      };
    });
  }
}
