import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Direct_Message } from './direct-message.entity';
import { User } from './user.entitiy';

@Entity('user_message_rooms')
export class User_Message_Room {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @OneToMany(() => Direct_Message, (message) => message.user_message_room, {
    cascade: true,
  })
  direct_messages: Direct_Message[];

  @ManyToOne(() => User, (user) => user.sender_ids, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  sender: User;

  @ManyToOne(() => User, (user) => user.receiver_ids, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  receiver: User;

  @CreateDateColumn()
  created_at: Date;
}
