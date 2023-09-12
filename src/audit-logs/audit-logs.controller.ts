import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';
import { AuthGuard } from 'src/_common/security/auth.guard';
import { Audit_log } from 'src/_common/entities/audit-log.entity';
import { Cron } from '@nestjs/schedule';
import { IResult } from 'src/_common/interfaces/result.interface';

@Controller()
export class AuditLogsController {
  constructor(private readonly auditLogService: AuditLogsService) {}

  @Get('workspaces/:workspaceId/getLogs')
  @UseGuards(AuthGuard)
  async getAllLogs(@Param('workspaceId') workspaceId: number): Promise<Audit_log[]> {
    return await this.auditLogService.getAllLogs(workspaceId);
  }

  // 생성일로부터 1개월이 지난 로그 삭제
  @Cron('0 0 * * *')
  async deleteLogs(): Promise<IResult> {
    console.log('생성일로부터 1개월이 지난 로그들이 삭제되었습니다.');
    return await this.auditLogService.deleteLogs();
  }
}
