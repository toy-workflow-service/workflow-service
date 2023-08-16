import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Workspace } from './workspace.entity';
import { Workspace_Member } from './workspace-member.entity';
import { Board_Member } from './board-member.entity';
import { Board_Message } from './board-message.entity';
import { Comment } from './comment.entity';
import { Direct_Message } from './direct-message.entity';
import { Reminder } from './reminder.entity';
import { Mention } from './mention.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ nullable: false, length: 320 })
  email: string;

  @Column({ nullable: false, length: 20 })
  name: string;

  @Column({ nullable: false, length: 20 })
  password: string;

  @Column({ type: 'tinyint', nullable: false })
  phone_number: number;

  @Column()
  profile_url: string;

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

  @OneToOne(() => Mention, (mention) => mention.send_id)
  @JoinColumn()
  mention_send_id: Mention;

  @OneToMany(() => Mention, (mention) => mention.receive_id, {
    cascade: true,
  })
  mention_receive_ids: Mention[];
}
