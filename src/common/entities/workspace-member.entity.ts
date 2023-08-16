import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entitiy';
import { Workspace } from './workspace.entity';

@Entity('workspace_members')
export class Workspace_Member {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'tinyint', nullable: false })
  role: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.workspace_members, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  user: User;

  @ManyToOne(() => Workspace, (workspace) => workspace.workspace_members, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  workspace: Workspace;
}
