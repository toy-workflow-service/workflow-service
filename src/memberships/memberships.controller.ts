import { Controller, Get, Param, UseGuards, UseInterceptors } from '@nestjs/common';
import { MembershipsService } from './memberships.service';
import { AuthGuard } from 'src/_common/security/auth.guard';
import { IResult } from 'src/_common/interfaces/result.interface';
import { Cron } from '@nestjs/schedule';
import { CheckMemberInterceptor } from 'src/_common/interceptors/check-member-interceptors';
import { Membership } from 'src/_common/entities/membership.entity';

@Controller('workspaces/:workspaceId')
export class MembershipsController {
  constructor(private readonly membershipService: MembershipsService) {}

  // Task Schheduling, 매일 자정에 아래의 api가 백엔드에서 자동 실행
  @Cron('0 0 * * *')
  async deleteExpiredMembership(): Promise<IResult> {
    return await this.membershipService.deleteExpiredMembership();
  }

  @Get('membership')
  @UseGuards(AuthGuard)
  @UseInterceptors(CheckMemberInterceptor)
  async getMyMembership(@Param('workspaceId') workspaceId: number): Promise<Membership> {
    return await this.membershipService.getMyMembership(workspaceId);
  }
}
