import { CreateDateColumn, Entity, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entitiy';
import { Comment } from './comment.entity';
import { Board_Message } from './board-message.entity';
import { Direct_Message } from './direct-message.entity';

@Entity('mentions')
export class Mention {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @CreateDateColumn()
  timestamp: Date;

  @OneToOne(() => User, (user) => user.mention_send)
  send_id: User;

  @ManyToOne(() => User, (user) => user.mention_receives, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  receive_id: User;

  @OneToOne(() => Comment, (comment) => comment.mention)
  comment: Comment;

  @OneToOne(() => Board_Message, (message) => message.mention)
  board_message: Board_Message;

  @OneToOne(() => Direct_Message, (message) => message.mention)
  direct_message: Direct_Message;
}
