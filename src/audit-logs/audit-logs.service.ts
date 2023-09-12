import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Audit_log } from 'src/_common/entities/audit-log.entity';
import { IResult } from 'src/_common/interfaces/result.interface';
import ActionType from 'src/_common/utils/action-type';
import { LessThan, Repository } from 'typeorm';

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectRepository(Audit_log)
    private auditLogRepository: Repository<Audit_log>
  ) {}

  async getAllLogs(workspaceId: number): Promise<Audit_log[]> {
    const allLogs = await this.auditLogRepository
      .createQueryBuilder('audit_log')
      .innerJoinAndSelect('audit_log.user', 'user')
      .where('audit_log.workspace = :workspaceId', { workspaceId })
      .select([
        'audit_log.id as id',
        'audit_log.actions as actions',
        'audit_log.details as details ',
        'audit_log.created_at as created_at',
        'user.id',
        'user.email',
        'user.profile_url',
      ])
      .orderBy('audit_log.created_at', 'DESC')
      .getRawMany();

    return allLogs;
  }

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
      details: `${inviterUserName}님이 ${invitedUserName}님을 워크스페이스에 초대하였습니다. `,
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
      details: `${userName}님이 ${deletedUser}님을 워크스페이스에서 내보냈습니다.`,
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
      details: `${userName}님이 ${targetUser}님의 역할을 ${role}로 변경했습니다.`,
    });

    return await this.auditLogRepository.save(newLog);
  }

  async createBoardLog(workspaceId: number, boardName: string, userId: number, userName: string): Promise<Audit_log> {
    const newLog = this.auditLogRepository.create({
      workspace: { id: workspaceId },
      user: { id: userId },
      actions: ActionType.CREATE,
      details: `${userName}님이 ${boardName} 보드를 생성하였습니다.`,
    });

    return await this.auditLogRepository.save(newLog);
  }

  async updateBoardLog(
    workspaceId: number,
    beforeBoardName: string,
    afterBoardName: string,
    userId: number,
    userName: string
  ): Promise<Audit_log> {
    if (beforeBoardName === afterBoardName) {
      const newLog = this.auditLogRepository.create({
        workspace: { id: workspaceId },
        user: { id: userId },
        actions: ActionType.UPDATE,
        details: `${userName}님이 ${beforeBoardName} 보드를 수정하였습니다.`,
      });

      return await this.auditLogRepository.save(newLog);
    } else {
      const newLog = this.auditLogRepository.create({
        workspace: { id: workspaceId },
        user: { id: userId },
        actions: ActionType.UPDATE,
        details: `${userName}님이 ${beforeBoardName} 보드를 ${afterBoardName} 보드로 수정하였습니다.`,
      });

      return await this.auditLogRepository.save(newLog);
    }
  }

  async deleteBoardLog(workspaceId: number, boardName: string, userId: number, userName: string): Promise<Audit_log> {
    const newLog = this.auditLogRepository.create({
      workspace: { id: workspaceId },
      user: { id: userId },
      actions: ActionType.DELETE,
      details: `${userName}님이 ${boardName} 보드를 삭제하였습니다.`,
    });

    return await this.auditLogRepository.save(newLog);
  }

  async createColumnLog(workspaceId: number, columnName: string, userId: number, userName: string): Promise<Audit_log> {
    const newLog = this.auditLogRepository.create({
      workspace: { id: workspaceId },
      user: { id: userId },
      actions: ActionType.CREATE,
      details: `${userName}님이 ${columnName} 컬럼을 생성하였습니다.`,
    });

    return await this.auditLogRepository.save(newLog);
  }

  async updateColumnLog(
    workspaceId: number,
    beforeColumnName: string,
    afterColumnName: string,
    userId: number,
    userName: string
  ): Promise<Audit_log> {
    if (beforeColumnName === afterColumnName) {
      const newLog = this.auditLogRepository.create({
        workspace: { id: workspaceId },
        user: { id: userId },
        actions: ActionType.UPDATE,
        details: `${userName}님이 ${beforeColumnName} 컬럼을 수정하였습니다.`,
      });

      return await this.auditLogRepository.save(newLog);
    } else {
      const newLog = this.auditLogRepository.create({
        workspace: { id: workspaceId },
        user: { id: userId },
        actions: ActionType.UPDATE,
        details: `${userName}님이 ${beforeColumnName} 컬럼을 ${afterColumnName} 컬럼으로 수정하였습니다.`,
      });

      return await this.auditLogRepository.save(newLog);
    }
  }

  async deleteColumnLog(workspaceId: number, columnName: string, userId: number, userName: string): Promise<Audit_log> {
    const newLog = this.auditLogRepository.create({
      workspace: { id: workspaceId },
      user: { id: userId },
      actions: ActionType.DELETE,
      details: `${userName}님이 ${columnName} 컬럼을 삭제하였습니다.`,
    });

    return await this.auditLogRepository.save(newLog);
  }

  async createCardLog(workspaceId: number, cardName: string, userId: number, userName: string): Promise<Audit_log> {
    const newLog = this.auditLogRepository.create({
      workspace: { id: workspaceId },
      user: { id: userId },
      actions: ActionType.CREATE,
      details: `${userName}님이 ${cardName} 카드를 생성하였습니다.`,
    });

    return await this.auditLogRepository.save(newLog);
  }

  async updateCardLog(
    workspaceId: number,
    beforeCardName: string,
    afterCardName: string,
    userId: number,
    userName: string
  ) {
    if (beforeCardName === afterCardName) {
      const newLog = this.auditLogRepository.create({
        workspace: { id: workspaceId },
        user: { id: userId },
        actions: ActionType.UPDATE,
        details: `${userName}님이 ${beforeCardName} 카드를 수정하였습니다.`,
      });

      return await this.auditLogRepository.save(newLog);
    } else {
      const newLog = this.auditLogRepository.create({
        workspace: { id: workspaceId },
        user: { id: userId },
        actions: ActionType.UPDATE,
        details: `${userName}님이 ${beforeCardName} 카드를 ${afterCardName} 카드로 수정하였습니다.`,
      });

      return await this.auditLogRepository.save(newLog);
    }
  }

  async deleteCardLog(workspaceId: number, cardName: string, userId: number, userName: string) {
    const newLog = this.auditLogRepository.create({
      workspace: { id: workspaceId },
      user: { id: userId },
      actions: ActionType.DELETE,
      details: `${userName}님이 ${cardName} 카드를 삭제하였습니다.`,
    });
    return await this.auditLogRepository.save(newLog);
  }

  async deleteLogs(): Promise<IResult> {
    const currentDate = new Date();
    const monthAgo = new Date();
    monthAgo.setMonth(currentDate.getMonth() - 1);

    const getLogs = await this.auditLogRepository.find({
      where: {
        created_at: LessThan(monthAgo),
      },
    });

    await this.auditLogRepository.remove(getLogs);

    return { result: true };
  }
}
