import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Workspace } from './workspace.entity';
import { Workspace_Member } from './workspace-member.entity';
import { Board_Member } from './board-member.entity';
import { Board_Message } from './board-message.entity';
import { Comment } from './comment.entity';
import { Direct_Message } from './direct-message.entity';
import { Reminder } from './reminder.entity';
import { Payment } from './payment.entity';
import { Audit_log } from './audit-log.entity';
import { User_Message_Room } from './user-message-room.entity';
import { Calendar } from './calendar.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ nullable: false, length: 320 })
  email: string;

  @Column({ nullable: false, length: 20 })
  name: string;

  @Column({ nullable: false })
  password: string;

  @Column({ type: 'tinytext', nullable: false, default: null })
  phone_number: string;

  @Column({ default: false })
  phone_authentication: boolean;

  @Column({ nullable: true })
  profile_url: string;

  @Column()
  points: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Workspace, (workspace) => workspace.user, {
    cascade: true,
  })
  workspaces: Workspace[];

  @OneToMany(() => Workspace_Member, (member) => member.user, {
    cascade: true,
  })
  workspace_members: Workspace_Member[];

  @OneToMany(() => Board_Member, (member) => member.user, {
    cascade: true,
  })
  board_members: Board_Member[];

  @OneToMany(() => Board_Message, (message) => message.user, {
    cascade: true,
  })
  board_messages: Board_Message[];

  @OneToMany(() => Comment, (comment) => comment.user, {
    cascade: true,
  })
  comments: Comment[];

  @OneToMany(() => Direct_Message, (message) => message.user, {
    cascade: true,
  })
  direct_messages: Direct_Message[];

  @OneToMany(() => Reminder, (reminder) => reminder.user, {
    cascade: true,
  })
  reminders: Reminder[];

  @OneToMany(() => Payment, (payment) => payment.user, {
    nullable: true,
  })
  payments: Payment[];

  @OneToMany(() => Audit_log, (log) => log.user, {
    cascade: false,
    nullable: true,
  })
  audit_logs: Audit_log[];

  @OneToMany(() => User_Message_Room, (room) => room.sender, {
    cascade: true,
    nullable: false,
  })
  sender_ids: User_Message_Room[];

  @OneToMany(() => User_Message_Room, (room) => room.receiver, {
    cascade: true,
    nullable: false,
  })
  receiver_ids: User_Message_Room[];

  @OneToMany(() => Calendar, (calendar) => calendar.user, {
    cascade: true,
  })
  calendars: Calendar[];
}
