import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entitiy';
import { Card } from './card.entity';
import { Mention } from './mention.entity';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ nullable: true })
  reply_id: number;

  @Column({ nullable: false })
  comment: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User, (user) => user.comments, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  user: User;

  @ManyToOne(() => Card, (card) => card.comments, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  card: Card;

  @OneToOne(() => Mention, (mention) => mention.comment)
  @JoinColumn()
  mention: Mention;
}
