import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entitiy';
import { Board } from './board.entity';

@Entity('board_members')
export class Board_Member {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @ManyToOne(() => User, (user) => user.board_members, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  user: User;

  @ManyToOne(() => Board, (board) => board.board_members, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  board: Board;
}
