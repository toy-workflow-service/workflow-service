import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entitiy';
<<<<<<< HEAD

=======
>>>>>>> 93a69eb06ceaba3351fbbff643cec23d378124bc
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

  @Column({ nullable: false })
  start_date: Date;

  @Column({ nullable: false })
  type: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User, (user) => user.calendars, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  user: User;
}
