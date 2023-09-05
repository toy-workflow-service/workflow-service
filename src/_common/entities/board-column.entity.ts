import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Board } from './board.entity';
import { Card } from './card.entity';
import { Audit_log } from './audit-log.entity';

@Entity('board_columns')
export class Board_Column {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ nullable: false, length: 20 })
  name: string;

  @Column({ type: 'tinyint', nullable: false })
  sequence: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Board, (board) => board.board_columns, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  board: Board;

  @OneToMany(() => Card, (card) => card.board_column, {
    cascade: true,
  })
  cards: Card[];

  @OneToMany(() => Audit_log, (log) => log.board_column)
  audit_logs: Audit_log[];
}
