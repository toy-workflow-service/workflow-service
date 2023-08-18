import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Workspace } from './workspace.entity';
import { User } from './user.entitiy';

@Entity('payment')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: true })
  status: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Workspace, (workspace) => workspace.payments, {
    cascade: true,
    nullable: false,
  })
  workspace: Workspace;

  @ManyToOne(() => User, (user) => user.payments, {
    nullable: false,
  })
  user: User;
}
