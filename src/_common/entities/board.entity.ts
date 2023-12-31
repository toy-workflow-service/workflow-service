import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Workspace } from './workspace.entity';
import { Board_Member } from './board-member.entity';
import { Board_Message } from './board-message.entity';
import { Board_Column } from './board-column.entity';

@Entity('boards')
export class Board {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ nullable: false, length: 20 })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  deadline: Date;

  @Column({ nullable: true })
  start_date: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Workspace, (workspace) => workspace.boards, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  workspace: Workspace;

  @OneToMany(() => Board_Member, (member) => member.board, {
    cascade: true,
  })
  board_members: Board_Member[];

  @OneToMany(() => Board_Message, (message) => message.board, {
    cascade: true,
  })
  board_messages: Board_Message[];

  @OneToMany(() => Board_Column, (column) => column.board, {
    cascade: true,
  })
  board_columns: Board_Column[];
}
