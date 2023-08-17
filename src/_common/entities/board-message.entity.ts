import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entitiy';
import { Board } from './board.entity';
import { Mention } from './mention.entity';

@Entity('board_messages')
export class Board_Message {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'text' })
  message: string;

  @Column()
  file_url: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User, (user) => user.board_messages, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  user: User;

  @ManyToOne(() => Board, (board) => board.board_messages, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  board: Board;

  @OneToOne(() => Mention, (mention) => mention.board_message)
  @JoinColumn()
  mention: Mention;
}
