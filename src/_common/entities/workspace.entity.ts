import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entitiy';
import { Workspace_Member } from './workspace-member.entity';
import { Board } from './board.entity';
import { Membership } from './membership.entity';
import { Payment } from './payment.entity';
import { Audit_log } from './audit-log.entity';

@Entity('workspaces')
export class Workspace {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  type: string;

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User, (user) => user.workspaces, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  user: User;

  @OneToMany(() => Workspace_Member, (member) => member.workspace, {
    cascade: true,
  })
  workspace_members: Workspace_Member[];

  @OneToMany(() => Board, (board) => board.workspace, {
    cascade: true,
  })
  boards: Board[];

  @OneToMany(() => Membership, (membership) => membership.workspace, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  memberships: Membership[];

  @OneToMany(() => Audit_log, (log) => log.workspace, {
    cascade: true,
    nullable: false,
  })
  audit_logs: Audit_log[];
}
