import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Board_Column } from './board-column.entity';
import { Comment } from './comment.entity';

@Entity('cards')
export class Card {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ nullable: false, length: 20 })
  name: string;

  @Column({ type: 'text', nullable: false })
  content: string;

  @Column({ type: 'json', nullable: true })
  file_original_name: string[];

  @Column({ type: 'json', nullable: true })
  file_url: string[];

  @Column({ type: 'tinyint', nullable: false })
  sequence: number;

  @Column({ type: 'json', nullable: true })
  members: string[];

  @Column()
  color: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Comment, (comment) => comment.card, {
    cascade: true,
  })
  comments: Comment[];

  @ManyToOne(() => Board_Column, (column) => column.cards, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  board_column: Board_Column;
  column: any;
}
