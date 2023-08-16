import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entitiy';

@Entity('reminders')
export class Reminder {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ nullable: false })
  message: string;

  @CreateDateColumn()
  remind_time: Date;

  @ManyToOne(() => User, (user) => user.reminders, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  user: User;
}
