import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entitiy';
import { Board } from './board.entity';

@Entity('board_messages')
export class Board_Message {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column({ nullable: true })
  file_url: string;

  @Column({ nullable: true })
  file_original_name: string;

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
}
