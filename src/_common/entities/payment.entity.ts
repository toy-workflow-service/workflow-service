import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Workspace } from './workspace.entity';
import { User } from './user.entitiy';

@Entity('payment')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  price: number;

  @Column()
  end_date: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Workspace, (workspace) => workspace.payments, {
    cascade: true,
    nullable: true,
  })
  workspace: Workspace;

  @ManyToOne(() => User, (user) => user.payments, {
    nullable: true,
  })
  user: User;
}
