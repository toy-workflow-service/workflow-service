import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entitiy';
import { User_Message_Room } from './user-message-room.entity';

@Entity('direct_messages')
export class Direct_Message {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'text' })
  message: string;

  @Column({ nullable: true })
  file_url: string;

  @Column({ nullable: true })
  file_original_name: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User, (user) => user.direct_messages, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  user: User;

  @ManyToOne(() => User_Message_Room, (room) => room.direct_messages, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  user_message_room: User_Message_Room;
}
