import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';
import { AuthGuard } from 'src/_common/security/auth.guard';
import { Audit_log } from 'src/_common/entities/audit-log.entity';

@Controller()
export class AuditLogsController {
  constructor(private readonly auditLogService: AuditLogsService) {}

  @Get('workspaces/:workspaceId/getLogs')
  @UseGuards(AuthGuard)
  async getAllLogs(@Param('workspaceId') workspaceId: number): Promise<Audit_log[]> {
    return await this.auditLogService.getAllLogs(workspaceId);
  }
}
