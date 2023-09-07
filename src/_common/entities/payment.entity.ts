import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entitiy';
import { Workspace } from './workspace.entity';

@Entity('payment')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: true })
  status: boolean;

  @Column({ nullable: false })
  workspaceId: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User, (user) => user.payments, {
    nullable: false,
  })
  user: User;

  // @ManyToOne(() => Workspace, (workspace) => workspace.payments, {
  //   nullable: false,
  // })
  // workspace: Workspace;
}
