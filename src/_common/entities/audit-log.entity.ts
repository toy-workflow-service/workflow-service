import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entitiy';
import { Workspace } from './workspace.entity';
import ActionType from '../utils/action-type';
import { Board } from './board.entity';
import { Board_Column } from './board-column.entity';
import { Card } from './card.entity';

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

  @ManyToOne(() => Workspace, (workspace) => workspace.audit_logs, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  workspace: Workspace;
}
