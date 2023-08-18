import { PrimaryGeneratedColumn, Column, CreateDateColumn, Entity, ManyToOne, UpdateDateColumn } from 'typeorm';
import { Workspace } from './workspace.entity';

@Entity('membership')
export class Membership {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ nullable: false })
  package_type: number;

  @Column({ nullable: false })
  package_price: number;

  @Column({ nullable: false })
  end_date: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Workspace, (workspace) => workspace.memberships, {
    cascade: true,
    nullable: true,
  })
  workspace: Workspace;
}
