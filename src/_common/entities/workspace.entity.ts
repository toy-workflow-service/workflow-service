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

@Entity('workspaces')
export class Workspace {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ nullable: false, length: 20 })
  name: string;

  @Column({ nullable: false })
  type: string;

  @Column()
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
}
