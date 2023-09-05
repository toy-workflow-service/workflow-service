import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entitiy';
import { Workspace } from './workspace.entity';
import { Board } from './board.entity';
import { Board_Column } from './board-column.entity';
import { Card } from './card.entity';

enum ActionType {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  INVITE = 'INVITE',
  ROLE_CHANGE = 'ROLE_CHANGE',
}

@Entity('audit_logs')
export class Audit_log {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'enum', enum: ActionType, nullable: false })
  actions: ActionType;

  @Column({ nullable: false })
  details: string;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => User, (user) => user.audit_logs)
  user: User;

  @ManyToOne(() => Workspace, (workspace) => workspace.audit_logs)
  workspace: Workspace;

  @ManyToOne(() => Board, (board) => board.audit_logs)
  board: Board;

  @ManyToOne(() => Board_Column, (column) => column.audit_logs)
  board_column: Board_Column;

  @ManyToOne(() => Card, (card) => card.audit_logs)
  card: Card;
}
