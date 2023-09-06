import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Audit_log } from 'src/_common/entities/audit-log.entity';
import ActionType from 'src/_common/utils/action-type';
import { Repository } from 'typeorm';

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectRepository(Audit_log)
    private auditLogRepository: Repository<Audit_log>
  ) {}

  async inviteMemberLog(
    workspaceId: number,
    inviterUserId: number,
    inviterUserName: string,
    invitedUserName: string
  ): Promise<Audit_log> {
    const newLog = this.auditLogRepository.create({
      workspace: { id: workspaceId },
      user: { id: inviterUserId },
      actions: ActionType.INVITE,
      details: `멤버 초대 - ${inviterUserName}님이 ${invitedUserName}님을 워크스페이스에 초대하였습니다. `,
    });

    return await this.auditLogRepository.save(newLog);
  }

  async deleteMemberLog(
    workspaceId: number,
    userId: number,
    userName: string,
    deletedUser: string
  ): Promise<Audit_log> {
    const newLog = this.auditLogRepository.create({
      workspace: { id: workspaceId },
      user: { id: userId },
      actions: ActionType.DELETE,
      details: `멤버 삭제 - ${userName}님이 ${deletedUser}님을 워크스페이스에서 내보냈습니다.`,
    });

    return await this.auditLogRepository.save(newLog);
  }

  async roleChangeLog(
    workspaceId: number,
    userId: number,
    userName: string,
    targetUser: string,
    role: string
  ): Promise<Audit_log> {
    const newLog = this.auditLogRepository.create({
      workspace: { id: workspaceId },
      user: { id: userId },
      actions: ActionType.ROLE_CHANGE,
      details: `역할 변경 - ${userName}님이 ${targetUser}님의 역할을 ${role}로 변경했습니다.`,
    });

    return await this.auditLogRepository.save(newLog);
  }

  async createBoardLog(
    workspaceId: number,
    boardId: number,
    boardName: string,
    userId: number,
    userName: string
  ): Promise<Audit_log> {
    const newLog = this.auditLogRepository.create({
      workspace: { id: workspaceId },
      user: { id: userId },
      actions: ActionType.CREATE,
      details: `보드 생성 - ${userName}님이 ${boardName} 보드를 생성하였습니다.`,
    });

    return await this.auditLogRepository.save(newLog);
  }

  async updateBoardLog(
    workspaceId: number,
    boardId: number,
    boardName: string,
    userId: number,
    userName: string
  ): Promise<Audit_log> {
    const newLog = this.auditLogRepository.create({
      workspace: { id: workspaceId },
      user: { id: userId },
      actions: ActionType.UPDATE,
      details: `보드 수정 - ${userName}님이 ${boardName} 보드를 수정하였습니다.`,
    });

    return await this.auditLogRepository.save(newLog);
  }

  async deleteBoardLog(
    workspaceId: number,
    boardId: number,
    boardName: string,
    userId: number,
    userName: string
  ): Promise<Audit_log> {
    const newLog = this.auditLogRepository.create({
      workspace: { id: workspaceId },
      user: { id: userId },
      actions: ActionType.DELETE,
      details: `보드 삭제 - ${userName}님이 ${boardName} 보드를 삭제하였습니다.`,
    });

    return await this.auditLogRepository.save(newLog);
  }

  // async createColumnLog() : Promise<Audit_log>{

  // }

  // async updateColumnLog(): Promise<Audit_log> {

  // }

  // async deleteColumnLog() : Promise<Audit_log>{

  // }

  // async createCardLog() : Promise<Audit_log>{

  // }

  // async updateCardLog

  // async deleteCardLog
}
