import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Direct_Message } from './direct-message.entity';

@Entity('user_message_rooms')
export class User_Message_Room {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ nullable: false })
  senderId: number;

  @Column({ nullable: false })
  receiveId: number;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => Direct_Message, (message) => message.user_message_room, {
    cascade: true,
  })
  direct_messages: Direct_Message[];
}
