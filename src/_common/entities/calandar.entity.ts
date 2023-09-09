import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('calendars')
export class Calendar {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ nullable: false, length: 20 })
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: false })
  deadline: Date;

  @Column('time', { nullable: false })
  deadline_time: Date;

  @Column({ nullable: false })
  start_date: Date;

  @Column('time', { nullable: false })
  start_date_time: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
